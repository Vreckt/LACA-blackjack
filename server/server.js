const error = require('./modules/error/error');
const BlackjackTable = require('./shared/models/table/blackjack');
const Player = require('./shared/models/player');
const socketKeys = require('./shared/enum/socketKeys');
const { decks } = require('./cards');
const ResponseBJAction = require('./shared/models/response/responseBlackJack');
var express = require('express');
const tableType = require('./shared/enum/tableType');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
        serveClient: false,
        pingInterval: 10000,
        pingTimeout: 5000,
        cookie: false
    });
var port =  8081;

let listServer = new Map();
let listPlayers = [];

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// sockets
io.on(socketKeys.Connection, (socket) => {
    let player = new Player(socket.conn.id, socket.handshake.query.username, socket.handshake.query.iconColor);
    if (listPlayers.find(p =>  p.id === socket.handshake.query.oldSocket)) {
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
            let table = null;
            switch (data.configs.tableType) {
                case tableType.Blackjack:
                    table = new BlackjackTable(roomId, data.roomName, data.configs.password, data.configs.difficulty, player);
                    break;
            }
            listServer.set(roomId, table);
            io.to(socket.id).emit(socketKeys.NewLobby, { roomId: roomId, roomName: data.roomName});
            socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
        } else {
            io.to(socket.id).emit(socketKeys.Error, errorMessage(2));
        }
    });

    socket.on(socketKeys.JoinTable, (data) => {
        let response = new ResponseBJAction();
        if (listServer.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            response = table.createResponse(table.players.find(p => p.id === table.currentPlayer));
            if (!table.hasPlayer(player.id)){
                table.addPlayerInTable(player);
                socket.to(data.roomId).emit(socketKeys.PlayerJoin, response);
            }
            socket.join(data.roomId);
            listServer.set(data.roomId, table);
            io.to(socket.id).emit(socketKeys.JoinTable, response);
        } else {
            io.to(socket.id).emit(socketKeys.Error, { message: errorMessage(1)});
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
        let response = new ResponseBJAction();
        if (listServer.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            socket.leave(data.roomId);
            if (table.players.length === 1) {
                listServer.delete(data.roomId);
                socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
            } else {
                const { nextPlayer, nextPlayerIndex } = table.getNextPlayer(player.id);
                if (table.currentPlayer === player.id && nextPlayerIndex < table.players.length) {
                    table.currentPlayer = nextPlayer.id;
                    response = table.createResponse(nextPlayer);
                } else {
                    response = table.createResponse(table.players.find(p => p.id === table.currentPlayer));
                }
                table.removePlayer(player);
            }
            socket.to(data.roomId).emit(socketKeys.PlayerLeave, response);
        } else {
            io.to(socket.id).emit(socketKeys.Error, { message: errorMessage(1)});
        }
    });

    socket.on(socketKeys.StartGame, (data) => {
        if (listServer.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            table.clean();
            table.startedTable()
            listServer.set(data.roomId, table);
            // send in room including sender
            io.in(data.roomId).emit(socketKeys.StartGame, {
                table: listServer.get(data.roomId)
            });
            setTimeout(() => {
                table.betTable();
                const response = table.manageBet();
                io.in(data.roomId).emit(socketKeys.PlayerBet, response);
            }, 100);
        } else {
            io.to(socket.id).emit(socketKeys.Error);
        }
    });

    socket.on(socketKeys.Action, (data) => {
        if (listServer.has(data.roomId)) {
            switch (data.actionKeys) {
                case socketKeys.DrawCard:
                    let table = listServer.get(data.roomId);
                    const playerIndex = table.players.findIndex(p => p.id === data.playerId);
                    if (table.hasPlayer(data.playerId)) {
                        response = table.drawCard(playerIndex);
                        table.setScoreToPlayer(playerIndex, response.point);
                        io.in(data.roomId).emit(socketKeys.DrawCard, response);
                    }
                    break;
                default:
                    break;
            }
        }
    });

    // Bet

    socket.on(socketKeys.PlayerBet, (data) => {
        let table = listServer.get(data.roomId);
        var currentPlayerIndex =table.players.findIndex(p => p.id === data.playerId);
        if (data.betMoney > 0 && data.betMoney <= table.players[currentPlayerIndex].credits) {
            table.players[currentPlayerIndex].credits -= data.betMoney;
            table.players[currentPlayerIndex].currentBet = data.betMoney;
            let response = table.manageBet(table.players[currentPlayerIndex].id);
            io.in(data.roomId).emit(socketKeys.PlayerBet, response);
            if (table.isPlayersAllBet()) {
              setTimeout(() => {
                  // Start the game because all players have bet
                  table.startedTable();
                  table.deck = new decks.StandardDeck({nbDeck: table.difficulty});
                  table.deck.shuffleAll();
                  for (let i = 0; i < 2;i++) {
                    setTimeout(()=>{
                      for (let p = 0; p < table.players.length; p++) {
                        setTimeout(()=>{
                            const response = table.drawCard(p);
                            table.setScoreToPlayer(p, response.point);
                            io.in(data.roomId).emit(socketKeys.DrawCard, response);
                        }, p * 1500);
                      }
                    }, i * 1500 * table.players.length);
                  }
                  setTimeout(()=>{
                    table.drawCard(table.bank, true);
                    table.drawCard(table.bank, true);
                    table.bank.hand[1].visible = false;
                    table.setCurrentPlayerTurn(table.players[0].id);
                    const response = table.createResponse(table.players[0]);
                    io.in(data.roomId).emit(socketKeys.PlayerTurn, response);
                  }, table.players.length * 3000);
              }, 1000);
          }
        } else {
            console.log('Le joueur est ruiné');
        }
    });

    socket.on(socketKeys.PlayerDouble, (data) => {
        let table = listServer.get(data.roomId);
        var currentPlayerIndex = table.players.findIndex(p => p.id === data.playerId);
        var currentPlayer = table.players[currentPlayerIndex];
        if (currentPlayer.currentBet * 2 <= currentPlayer.credits) {
            table.players[currentPlayerIndex].credits -= currentPlayer.currentBet;
            table.players[currentPlayerIndex].currentBet = currentPlayer.currentBet * 2;
            table.players[currentPlayerIndex].hasDouble = true;
            let response = table.drawCard(currentPlayerIndex);
            listServer.set(data.roomId, table);
            io.in(data.roomId).emit(socketKeys.PlayerBet, response);
        } else {
            console.log("Le joueur ne peut pas doubler, il n'a pas assez de thunes")
        }
    });

    socket.on(socketKeys.PlayerEnd, (data) => {
        var currentTable = listServer.get(data.roomId);
        if (currentTable.players.findIndex(p => p.id === data.playerId) === (currentTable.players.length - 1)) {
            let response = currentTable.calculateHand(currentTable.bank);
            currentTable.bank.hand[1].visible = true;
            currentTable.bank.point = response.point;
            currentTable.bank.isBlackjack = response.isBlackJack;
            currentTable.bank.isWin = response.isWin;
            response.table = currentTable;
            // permet d'envoyer à tout le monde la liste des cartes de la banque avec toutes les cartes retournées
            io.in(data.roomId).emit(socketKeys.BankShowCard, response);
            // on copie la main de la bank dans une nouvelle liste
            let cardsDraw = currentTable.bank.hand.slice();
            if (response.point < 17) {
                // on fait tirer la bank tant que son nombre de quoi n'est pas supérieur ou égal à 17
                while (response.point < 17) {
                    cardsDraw.push(currentTable.bankDrawCard());
                    response = currentTable.calculateHand({hand: cardsDraw});
                }
                // on boucle sur la liste qu'on à créer pour envoyer à tout le monde une carte à la fois
                for (let i = 2; i < cardsDraw.length; i++) {
                    setTimeout(()=>{
                        currentTable.bank.hand.push(cardsDraw[i]);
                        response = currentTable.calculateHand(currentTable.bank);
                        currentTable.bank.point = response.point;
                        currentTable.bank.isBlackjack = response.isBlackJack;
                        currentTable.bank.isWin = response.isWin;
                        response.table = currentTable;
                        response.cardDraw = cardsDraw[i];
                        io.in(data.roomId).emit(socketKeys.BankDrawCard, response);
                        if (i === cardsDraw.length - 1){
                            response.table = currentTable.manageEndGame();
                            io.in(data.roomId).emit(socketKeys.FinishGame, response);
                            console.log("finishGame with cards draw by the bank");
                        }
                    }, i * 1000);
                }
            } else {
                response.table = currentTable.manageEndGame();
                io.in(data.roomId).emit(socketKeys.FinishGame, response);
                console.log("Finish game with no cards draw by the bank");
            }

        } else {
            const { nextPlayer, nextPlayerIndex } = currentTable.getNextPlayer(player.id);
            const response = currentTable.calculateHand(nextPlayer);
            response.table = currentTable;
            if (nextPlayer.hand.length === 0) {
                response.table = currentTable.manageEndGame();
                io.in(data.roomId).emit(socketKeys.FinishGame, response);
            } else {
                currentTable.currentPlayer = nextPlayer.id;
                listServer.set(data.roomId, currentTable);
                response.table = listServer.get(data.roomId);
                io.in(data.roomId).emit(socketKeys.PlayerTurn, response);
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
    return Array.from( listServer.values());
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