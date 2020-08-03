const BlackjackTable = require('./shared/models/table/blackjack');
const Player = require('./shared/models/player');
const socketKeys = require('./shared/enum/socketKeys');
const { decks } = require('./cards');
const ResponseBJAction = require('./shared/models/response/responseBlackJack');
const ServerResponse = require('./shared/models/response/server-Response');
var express = require('express');
const tableType = require('./shared/enum/tableType');
const Table = require('./shared/models/table/table');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
});
var port = 8081;

let listServer = new Map();
let listPlayers = [];

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// sockets
io.on(socketKeys.Connection, (socket) => {
    let player = new Player(socket.conn.id, socket.handshake.query.username, socket.handshake.query.iconColor);
    if (listPlayers.find(p => p.id === socket.handshake.query.oldSocket)) {
        socket.conn.id = socket.handshake.query.oldSocket;
        player.id = socket.handshake.query.oldSocket;
        for (const usr of listPlayers) {
            if (usr.id === socket.handshake.query.oldSocket && usr.name === socket.handshake.query.username) {
                usr.id = player.id;
            }
        }
    } else {
        listPlayers.push(player);
    }

    socket.emit(socketKeys.Connected, {
        id: socket.conn.id,
        servers: extractServerName()
    });

    socket.on(socketKeys.NewLobby, data => {
        const roomId = createRoomId(32) + player.id;
        if (!listServer.has(roomId)) {
            let table = new Table(null, null, null, null);
            switch (data.configs.tableType) {
                case tableType.Blackjack:
                    table = new BlackjackTable(roomId, data.roomName, data.configs.password, data.configs.difficulty, player);
                    break;
            }
            listServer.set(roomId, table);
            io.to(socket.id).emit(socketKeys.NewLobby, { roomId: roomId, roomName: data.roomName });
            socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
        }
    });

    socket.on(socketKeys.JoinTable, (data) => {
        if (listServer.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            let response = new ServerResponse(table, player.id);
            response = table.joinTable(player);
            if (!table.hasPlayer(player.id)) {
                response.message = table.addPlayerInTable(player);
                socket.to(data.roomId).emit(socketKeys.PlayerJoin, response);
            }
            socket.join(data.roomId);
            listServer.set(data.roomId, table);
            io.to(socket.id).emit(socketKeys.JoinTable, response);
        }
    });

    socket.on(socketKeys.PlayerKick, (data) => {
        if (data.roomId.includes(data.currentPlayerId)) { //if yes, it's an admin
            const kickPlayer = listPlayers.find(p => p.id === data.kickPlayerId);
            if (kickPlayer) {
                io.to(data.roomId).emit(socketKeys.PlayerKick, {
                    kickPlayer: kickPlayer
                });
            }
        }
    });

    socket.on(socketKeys.LeaveTable, (data) => {
        if (listServer.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            let response = new ServerResponse(table, player.id);
            socket.leave(data.roomId);
            if (table.players.length === 1) {
                listServer.delete(data.roomId);
                socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
            } else {
                const { nextPlayer, nextPlayerIndex } = table.getNextPlayer(player.id);
                if (table.currentPlayer === player.id && nextPlayerIndex < table.players.length) {
                    table.currentPlayer = nextPlayer.id;
                    switch (table.type) {
                        case tableType.Blackjack:
                            table.currentPlayer = nextPlayer.id;
                            response = table.createResponse(nextPlayer);
                            break;
                    }
                }
                table.removePlayer(player);
                response = table.leaveTable(player);
            }
            socket.to(data.roomId).emit(socketKeys.PlayerLeave, response);
        }
    });

    socket.on(socketKeys.StartGame, (data) => {
        if (listServer.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            table.clean();
            table.startedTable()
            listServer.set(data.roomId, table);
            io.in(data.roomId).emit(socketKeys.StartGame, { table: listServer.get(data.roomId) });
            setTimeout(() => {
                table.betTable();
                switch (table.type) {
                    case tableType.Blackjack:
                        io.in(data.roomId).emit(socketKeys.PlayerBet, table.manageBet());
                        break;
                }
            }, 100);
        }
    });

    socket.on(socketKeys.Action, (data) => {
        if (listServer.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            const playerIndex = table.players.findIndex(p => p.id === data.playerId);
            switch (data.actionKeys) {
                case socketKeys.DrawCard: {
                    if (table.hasPlayer(data.playerId)) {
                        response = table.drawCard(playerIndex);
                        table.setScoreToPlayer(playerIndex, response.point);
                        io.in(data.roomId).emit(socketKeys.DrawCard, response);
                    }
                    break;
                }
                case socketKeys.PlayerDouble: {
                    if (table.hasPlayer(data.playerId)) {
                        let response = table.doubleBet(playerIndex, table.players[playerIndex]);
                        table.setScoreToPlayer(playerIndex, response.point);
                        listServer.set(data.roomId, table);
                        io.in(data.roomId).emit(socketKeys.PlayerBet, response);
                    }
                    break;
                }
                case socketKeys.PlayerBet: {
                    if (table.hasPlayer(data.playerId)) {
                        if (data.betMoney > 0 && data.betMoney <= table.players[playerIndex].credits) {
                            io.in(data.roomId).emit(socketKeys.PlayerBet, table.playerBet(data.betMoney, playerIndex));
                            if (table.isPlayersAllBet()) {
                                table.startedTable();
                                table.deck = new decks.StandardDeck({ nbDeck: table.difficulty });
                                table.deck.shuffleAll();
                                for (let i = 0; i < 2; i++) {
                                    setTimeout(() => {
                                        for (let p = 0; p <= table.players.length; p++) {
                                            setTimeout(() => {
                                                if (p !== table.players.length) {
                                                    const response = table.drawCard(p);
                                                    table.setScoreToPlayer(p, response.point);
                                                    io.in(data.roomId).emit(socketKeys.DrawCard, response);
                                                } else {
                                                    const response = table.drawCard(table.bank, true);
                                                    if (table.bank.hand.length > 1) {
                                                        table.bank.hand[1].visible = false;
                                                    }
                                                    io.in(data.roomId).emit(socketKeys.DrawCard, response);
                                                }
                                            }, p * 1300);
                                        }
                                    }, i * 1300 * (table.players.length + 1));
                                }
                                setTimeout(() => {
                                    table.setCurrentPlayerTurn(table.players[0].id);
                                    io.in(data.roomId).emit(socketKeys.PlayerTurn, table.createResponse(table.players[0]));
                                }, (table.players.length + 1) * 2600);
                            }
                        } else {
                            console.log('info-playerNoMoney');
                        }
                    }
                    break;
                }
                case socketKeys.PlayerEnd: {
                    if (table.players.findIndex(p => p.id === data.playerId) === (table.players.length - 1)) {
                        let response = table.calculateHand(table.bank);
                        io.in(data.roomId).emit(socketKeys.BankShowCard, table.playerEnds(response));
                        if (response.point < 17) {
                            const drawedCards = table.bankEndDraw(response.point);
                            for (let i = 2; i < drawedCards.length; i++) {
                                setTimeout(() => {
                                    if (i === drawedCards.length - 1) {
                                        response.table = table.manageEndGame();
                                        io.in(data.roomId).emit(socketKeys.FinishGame, response);
                                    } else {
                                        io.in(data.roomId).emit(socketKeys.BankDrawCard, table.bankDrawCard(drawedCards[i]));
                                    }
                                }, i * 1000);
                            }
                        } else {
                            response.table = table.manageEndGame();
                            io.in(data.roomId).emit(socketKeys.FinishGame, response);
                            console.log("Finish game with no cards draw by the bank");
                        }

                    } else {
                        const { nextPlayer, nextPlayerIndex } = table.getNextPlayer(player.id);
                        const response = table.calculateHand(nextPlayer);
                        response.table = table;
                        if (nextPlayer.hand.length === 0) {
                            response.table = table.manageEndGame();
                            io.in(data.roomId).emit(socketKeys.FinishGame, response);
                        } else {
                            table.currentPlayer = nextPlayer.id;
                            listServer.set(data.roomId, table);
                            response.table = listServer.get(data.roomId);
                            io.in(data.roomId).emit(socketKeys.PlayerTurn, response);
                        }
                    }
                    break;
                }
                default:
                    break;
            }
        }
    });

    socket.on(socketKeys.Trigger, () => {
        io.to(socket.id).emit('trigger');
    });

    socket.on(socketKeys.Disconnect, () => {
        console.log('player disconnected');
    });
});

const extractServerName = () => {
    return Array.from(listServer.values());
};

const createRoomId = (length = 64) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};