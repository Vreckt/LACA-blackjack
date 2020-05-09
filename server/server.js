const bj = require('./modules/blackjack/blackjack');
const error = require('./modules/error/error');
const Table = require('./shared/models/table'),
    Player = require('./shared/models/player'),
    socketKeys = require('./shared/enum/socketKeys'),
    { decks } = require('./cards');
    
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server, {
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
    console.log('User connected !');
    let user = new Player(socket.conn.id, socket.handshake.query.username);

    if (listPlayers.find(u =>  u.id === socket.handshake.query.oldSocket)) {
        socket.conn.id = socket.handshake.query.oldSocket;
        user.id = socket.handshake.query.oldSocket;
        for (const usr of listPlayers) {
            if (usr.id === socket.handshake.query.oldSocket && usr.name === socket.handshake.query.username) {
                usr.id = user.id;
            }
        }
        console.log('OLD USER');
    } else {
        console.log('NEW USER');
        listPlayers.push(user);
    }

    socket.emit(socketKeys.Connected, {
        id: socket.conn.id,
        servers: extractServerName()
    });

    socket.on(socketKeys.NewLobby, data => {
        const roomId = createRoomId(32) + user.id;
        if (!listServer.has(roomId)) {
            // const usr = listPlayers.find(u => u.id === user.id);
            let table = new Table(roomId, data.roomName, 1);
            table.users.push(user);
            table.adminId = user.id;
            listServer.set(roomId, table);
            io.to(socket.id).emit(socketKeys.NewLobby, { roomId: roomId, roomName: data.roomName});
            socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
        } else {
            // Error
            io.to(socket.id).emit('Error', errorMessage(2));
        }
    });

    socket.on(socketKeys.JoinTable, (data) => {
        if (listServer.has(data.roomId)) {
            // const usr = listPlayers.find(u => u.id === user.id);
            if (!listServer.get(data.roomId).users.find(u => u.id === user.id)){
                listServer.get(data.roomId).users.push(user);
                socket.to(data.roomId).emit(socketKeys.PlayerJoin, {
                    table: listServer.get(data.roomId),
                    status: 'success'
                });
            }
            socket.join(data.roomId);
            io.to(socket.id).emit(socketKeys.JoinTable, {
                table: listServer.get(data.roomId),
                status: 'success'
            });
        } else {
            // Error
            io.to(socket.id).emit('Error', { message: errorMessage(1)});
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
        let table = listServer.get(data.roomId);
        const { nextPlayer, nextPlayerIndex } = table.getNextPlayer(user.id);
        let response = null;
        socket.leave(data.roomId);
        table.users.splice(nextPlayerIndex - 1, 1);
        if (table.users.length === 0) {
            listServer.delete(data.roomId);
            socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
        } else {
            if (table.currentPlayer === user.id) {
                table.currentPlayer = nextPlayer.id;
                response = bj.manageBlackjack(nextPlayer.hand, nextPlayer);
            } else {
                response = bj.manageBlackjack(table.getPlayerHand(table.currentPlayer), table.currentPlayer);
            }
            if (table.adminId === user.id) {
                table.adminId = nextPlayer.id;
            }
            response.table = table;
        }
        listServer.set(data.roomId, table);
        socket.to(data.roomId).emit(socketKeys.PlayerLeave, response);
    });

    socket.on(socketKeys.StartGame, (data) => {
        if (listServer.has(data.roomId)) {
            let table = new Table();
            table = listServer.get(data.roomId);
            table.clean();

            table.startedTable()
            listServer.set(data.roomId, table);
            // send in room including sender
            io.in(data.roomId).emit(socketKeys.StartGame, {
                table: listServer.get(data.roomId)
            });
            setTimeout(() => {
                table.betTable();
                const response = bj.manageBet(table);

                io.in(data.roomId).emit(socketKeys.PlayerBet, response);
            }, 1000);
        } else {
            io.to(socket.id).emit(socketKeys.Error);
        }
    });

    // Bet

    socket.on(socketKeys.PlayerBet, (data) => {
        var currentPlayerIndex = listServer.get(data.roomId).users.findIndex(p => p.id === data.userId);
        if (data.betMoney > 0 && data.betMoney <= listServer.get(data.roomId).users[currentPlayerIndex].credits) {
            listServer.get(data.roomId).users[currentPlayerIndex].credits -= data.betMoney;
            listServer.get(data.roomId).users[currentPlayerIndex].currentBet = data.betMoney;
            let response = bj.manageBet(listServer.get(data.roomId), listServer.get(data.roomId).users[currentPlayerIndex].id);

            io.in(data.roomId).emit(socketKeys.PlayerBet, response);

            if (listServer.get(data.roomId).isPlayersAllBet()) {
              setTimeout(() => {
                  // Start the game because all players have bet
                  let table = listServer.get(data.roomId);
                  table.startedTable();
                  table.deck = new decks.StandardDeck({nbDeck: table.nbDeck});
                  table.deck.shuffleAll();
                  let i = 0;
                  while (i < 2) {
                      for (const player of table.users) {
                          player.hand.push(bj.drawCard(table.deck.draw(1)));
                          player.score = bj.manageBlackjack(player.hand, player).point;
                      }
                      i++;
                  }
                  table.bank.hand.push(bj.drawCard(table.deck.draw(1)));
                  table.bank.hand.push(bj.drawCard(table.deck.draw(1)));
                  table.bank.hand[1].visible = false;
                  table.setCurrentPlayerTurn(table.users[0].id);
                  listServer.set(data.roomId, table);
                  const response = bj.manageBlackjack(table.users[0].hand, table.users[0]);
                  response.table = listServer.get(data.roomId);
                  io.in(data.roomId).emit(socketKeys.PlayerTurn, response);
              }, 1000);
          }
        } else {
            console.log('Le joueur est ruiné');
        }
    })

    socket.on(socketKeys.PlayerDouble, (data) => {
        var currentPlayerIndex = listServer.get(data.roomId).users.findIndex(p => p.id === data.userId);
        var currentPlayer = listServer.get(data.roomId).users[currentPlayerIndex];
        if (currentPlayer.currentBet * 2 <= currentPlayer.credits) {
            listServer.get(data.roomId).users[currentPlayerIndex].credits -= currentPlayer.currentBet;
            listServer.get(data.roomId).users[currentPlayerIndex].currentBet = currentPlayer.currentBet * 2;
            listServer.get(data.roomId).users[currentPlayerIndex].hasDouble = true;
            let response = bj.manageBlackjack(listServer.get(data.roomId).users[currentPlayerIndex].hand, listServer.get(data.roomId).users[currentPlayerIndex]);
            response.table = listServer.get(data.roomId);
            io.in(data.roomId).emit(socketKeys.PlayerBet, response);
            drawCard(data, user, true);
        } else {
            console.log("Le joueur ne peut pas doubler, il n'a pas assez de thunes")
        }
    })

    socket.on(socketKeys.DrawCard, (data) => {
        drawCard(data, user);
    });

    socket.on(socketKeys.PlayerEnd, (data) => {
        var currentTable = listServer.get(data.roomId);
        if (currentTable.users.findIndex(u => u.id === data.userId) === (currentTable.users.length - 1)) {
            let response = bj.manageBlackjack(currentTable.bank.hand);
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
                    cardsDraw.push(bj.drawCard(currentTable.deck.draw(1)));
                    response = bj.manageBlackjack(cardsDraw);
                }
                // on boucle sur la liste qu'on à créer pour envoyer à tout le monde une carte à la fois
                for (let i = 2; i < cardsDraw.length; i++) {
                    setTimeout(()=>{
                        currentTable.bank.hand.push(cardsDraw[i]);
                        response = bj.manageBlackjack(currentTable.bank.hand);
                        currentTable.bank.point = response.point;
                        currentTable.bank.isBlackjack = response.isBlackJack;
                        currentTable.bank.isWin = response.isWin;
                        response.table = currentTable;
                        response.cardDraw = cardsDraw[i];
                        io.in(data.roomId).emit(socketKeys.BankDrawCard, response);
                        if (i === cardsDraw.length - 1){
                            response.table = bj.manageEndGame(response.table);
                            io.in(data.roomId).emit(socketKeys.FinishGame, response);
                            console.log("finishGame with cards draw by the bank");
                        }
                    }, i * 1000);
                }
            } else {
                response.table = bj.manageEndGame(response.table);
                io.in(data.roomId).emit(socketKeys.FinishGame, response);
                console.log("Finish game with no cards draw by the bank");
            }

        } else {
            const nextPlayerIndex = currentTable.users.findIndex(u => u.id === user.id) + 1;
            const nextPlayer = currentTable.users[nextPlayerIndex];
            currentTable.currentPlayer = nextPlayer.id;
            listServer.set(data.roomId, currentTable);
            console.log(nextPlayer);
            const response = bj.manageBlackjack(nextPlayer.hand, nextPlayer);
            response.table = listServer.get(data.roomId);
            io.in(data.roomId).emit(socketKeys.PlayerTurn, response);
        }
    });

    socket.on(socketKeys.Trigger, () => {
        io.to(socket.id).emit('trigger');
    });

    socket.on(socketKeys.Disconnect, () => {
        console.log('user disconnected');

    });
});

const drawCard = (data, user) => {
    if (listServer.has(data.roomId)) {
        let table = new Table();
        table = listServer.get(data.roomId);
        const playerIndex = table.users.findIndex(u => u.id === data.userId);
        if (table.users[playerIndex]) {
            const card = bj.drawCard(table.deck.draw(1));
            table.users[playerIndex].hand.push(card);
            const response = bj.manageBlackjack(table.users[playerIndex].hand, user);
            table.users[playerIndex].score = response.point;
            response.cardDraw = card;
            response.table = table;
            listServer.set(data.roomId, table);
            // on envoit à toutes la room
            io.in(data.roomId).emit(socketKeys.DrawCard, response);
        }
    }
}

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