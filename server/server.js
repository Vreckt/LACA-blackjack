const Table = require('./shared/models/table');
const Player = require('./shared/models/player');
const socketKeys = require('./shared/enum/socketKeys');
const { decks } = require('./cards');
var express = require('express');
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

    socket.on(socketKeys.NewLobby, (data) => {
        const roomId = createRoomId(32) + user.id;
        if (!listServer.has(roomId)) {
            listServer.set(roomId, new Table(roomId, data.roomName, 1));
            io.to(socket.id).emit(socketKeys.NewLobby, { roomId: roomId, roomName: data.roomName});
            socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
        } else {
            // Error
            io.to(socket.id).emit(socketKeys.NewLobby, { roomid: null, roomName: data.roomName });
        }
    });

    socket.on(socketKeys.JoinTable, (data) => {
        if (listServer.has(data.roomId)) {
            const usr = listPlayers.find(u => u.id === user.id);
            if (!listServer.get(data.roomId).users.find(u => u.id === usr.id)){
                listServer.get(data.roomId).users.push(usr);
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
            io.to(socket.id).emit(socketKeys.JoinTable, { table: null, status: 'error'});
        }
    });

    socket.on(socketKeys.LeaveTable, (data) => {
        socket.leave(data.roomId);
        const usrIndex = listServer.get(data.roomId).users.findIndex(u => u.id === user.id);
        listServer.get(data.roomId).users.splice(usrIndex, 1);
        if (listServer.get(data.roomId).users.length === 0) {
            listServer.delete(data.roomId);
            socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
        }
        socket.to(data.roomId).emit(socketKeys.PlayerLeave, {
            table: listServer.get(data.roomId),
            status: 'success'
        });
    });


    socket.on(socketKeys.StartGame, (data) => {
        if (listServer.has(data.roomId)) {
            let table = new Table();
            table = listServer.get(data.roomId);
            for (const player of table.users) {
                player.hand = [];
            }
            table.startedTable();
            table.deck = new decks.StandardDeck({nbDeck: table.nbDeck});
            table.deck.shuffleAll();
            let i = 0;
            while (i < table.users.length) {
                for (const player of table.users) {
                    player.hand.push(drawCard(table.deck.draw(1)));
                }
                i++;
            }
            table.bank.hand.push(drawCard(table.deck.draw(1)));
            table.bank.hand.push(drawCard(table.deck.draw(1)));
            table.bank.hand[1].visible = false;
            listServer.set(data.roomId, table);
            // send in room including sender
            io.in(data.roomId).emit(socketKeys.StartGame, {
                table: listServer.get(data.roomId),
                round:table.users[0].id
            });
        } else {
            io.to(socket.id).emit(socketKeys.Error);
        }
    });

    socket.on(socketKeys.DrawCard, (data) => {
        if (listServer.has(data.roomId)) {
            let table = new Table();
            table = listServer.get(data.roomId);
            // récupère l'index du joueur dans la liste ed la table
            const playerIndex = table.users.findIndex(u => u.id === data.userId);
            if (table.users[playerIndex]) {
                // draw une carte
                const card = drawCard(table.deck.draw(1));
                // j'ajoue la parte dans la main du joueur
                table.users[playerIndex].hand.push(card);
                const { point, blackjack, win } = manageBlackjack(table.users[playerIndex].hand);
                listServer.set(data.roomId, table);
                // on envoit à toutes la room
                io.in(data.roomId).emit(socketKeys.DrawCard, {
                    userId: data.userId,
                    cardDraw: card,
                    point: point,
                    isWin: win,
                    isBlackJack: blackjack,
                    isShowDrawButton: false,
                    isShowDoubleButton: false,
                    table: table
                });
            }
        }
    });

    socket.on(socketKeys.Trigger, () => {

        io.to(socket.id).emit('trigger');
    });

    socket.on(socketKeys.Disconnect, () => {
        console.log('user disconnected');
        // socket.leave()
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

const drawCard = (cardDraw) => {
// refait un objet carte plus simplifié 
    const card = {
        // ex: AS | 10S ...
        name: cardDraw[0].rank.shortName + cardDraw[0].suit.name,
        shortName:  cardDraw[0].rank.shortName,
        visible: true,
        value: 0
    };
    if (['A', 'J', 'Q', 'K'].includes(cardDraw[0].rank.shortName)) {
        // si c'est un AS
        if (cardDraw[0].rank.shortName === 'A') {
            card.value = 1 | 11;
        } else {
            // si c'est autre chose
            card.value = 10;
        }
    } else {
        // si oui j'ajoute la valeur dans value
        card.value = +card.shortName;
    }
    return card;
};

const manageBlackjack = (listCards) => {
    let point = 0;
    let isBlackJack = false;
    let isWin = false;
    for (const card of listCards) {
        if (card.shortName === 'A') {
            if (point > 10) {
                ++point;
            } else if (point < 10) {
                point += 11;
            } else if (point == 10) {
                point += 11;
                isWin = true;
                isBlackJack = true;
            } else {
                point += 11;
                isWin = false
            }
        } else {
            point += card.value;
        }
    }
    return { point: point, isBlackJack: isBlackJack, isWin: isWin };
};