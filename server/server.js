const Table = require('./shared/models/table'),
    Player = require('./shared/models/player'),
    socketKeys = require('./shared/enum/socketKeys'),
    { decks } = require('./cards'),
    ResponseBJAction = require('./shared/models/response/responseBlackJack');
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
        console.log(data);
        const roomId = createRoomId(32) + user.id;
        if (!listServer.has(roomId)) {
            const usr = listPlayers.find(u => u.id === user.id);
            let table = new Table(roomId, data.roomName, 1);
            table.users.push(usr);
            listServer.set(roomId, table);
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
            console.log(listServer.get(data.roomId));
            io.to(socket.id).emit(socketKeys.JoinTable, {
                table: listServer.get(data.roomId),
                status: 'success'
            });
        } else {
            // Error
            console.log('Error');
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
            while (i < 2) {
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
                table: listServer.get(data.roomId)
            });
            setTimeout(() => {
                const response = manageBlackjack(table.users.find(u => u.id === user.id).hand, user.id);
                response.table = listServer.get(data.roomId);
                io.in(data.roomId).emit(socketKeys.TurnPlayer, response);
            }, 3000);
        } else {
            io.to(socket.id).emit(socketKeys.Error);
        }
    });

    socket.on(socketKeys.DrawCard, (data) => {
        if (listServer.has(data.roomId)) {
            let table = new Table();
            table = listServer.get(data.roomId);
            const playerIndex = table.users.findIndex(u => u.id === data.userId);
            if (table.users[playerIndex]) {
                const card = drawCard(table.deck.draw(1));
                table.users[playerIndex].hand.push(card);
                const response = manageBlackjack(table.users[playerIndex].hand, user.id);
                response.cardDraw = card;
                response.table = table;
                listServer.set(data.roomId, table);
                // on envoit à toutes la room
                io.in(data.roomId).emit(socketKeys.DrawCard, response);
            }
        }
    });

    socket.on('EndTurn', (data) => {
        if (listServer.get(data.roomId).users.findIndex(u => u.id === data.userId) === (listServer.get(data.roomId).users.length - 1)) {
            // Logan
        } else {
            // Alex
            const response = manageBlackjack(table.users.find(u => u.id === user.id).hand, user.id);
            response.table = listServer.get(data.roomId);
            io.in(data.roomId).emit(socketKeys.TurnPlayer, response);
        }
    });

    socket.on(socketKeys.Trigger, () => {
        io.to(socket.id).emit('trigger');
    });

    socket.on(socketKeys.Disconnect, () => {
        console.log('user disconnected');

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
            card.value = 11;
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

const manageBlackjack = (listCards, userId) => {
    let point = 0;
    let isBlackJack = false;
    let isWin = false;
    const sortedCardList = listCards.sort((a, b) => { return a.value - b.value });
    for (const card of sortedCardList) {
        if (card.shortName != 'A') {
            point += card.value;
        } else {
            if (point > 10) {
                ++point;
            } else if (point < 10 || point == 10) {
                point += 11;
            }
        }
        if (point > 21) {
            isWin = false;
        } else if (point === 21) {
            isWin = true;
            isBlackJack = true;
        } else {
            isWin = true;
        }
    }

    const response = new ResponseBJAction();
    
    response.userId = userId;
    response.point= point;
    response.isWin= isWin;
    response.isBlackJack= isBlackJack;
    response.isShowDoubleButton = (listCards.length < 3);
    response.isShowDrawButton = (point < 21);

    return response;
};