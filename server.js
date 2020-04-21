const User = require('./user')
const Table = require('./table');
const socketKeys = require('./socketKeys');
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

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

app.get('/', (req, res) => {
    res.send('<h1>BlackJack Server</h1>');
});

let listServer = new Map();
let listUsers = [];

console.log(socketKeys.Connection);

io.sockets.on(socketKeys.Connection, (socket) => {
    console.log('User connected !');
    let user = new User(socket.conn.id, socket.handshake.query.username)

    if (listUsers.find(u =>  u.id === socket.handshake.query.oldSocket && u.name === u.name)) {
        socket.conn.id = socket.handshake.query.oldSocket;
        user.id = socket.handshake.query.oldSocket;
        for (const usr of listUsers) {
            if (usr.id === socket.handshake.query.oldSocket && usr.name === socket.handshake.query.username) {
                usr.id = user.id;
            }
        }
        console.log('OLD USER');
    } else {
        console.log('NEW USER');
        listUsers.push(user);
    }

    socket.emit(socketKeys.Connected, {
        id: socket.conn.id,
        servers: extractServerName()
    });

    socket.on(socketKeys.NewLobby, (data) => {
        const roomId = createRoomId(32) + user.id;
        // && listServer.get(roomId).users.length < 7
        if (!listServer.has(roomId)) {
            listServer.set(roomId, new Table(roomId, data.roomName, null));
            io.to(socket.id).emit(socketKeys.NewLobby, { roomId: roomId, roomName: data.roomName});
            socket.broadcast.emit(socketKeys.UpdateLobby, { servers: extractServerName() });
        } else {
            // Error
            io.to(socket.id).emit(socketKeys.NewLobby, { roomid: null, roomName: data.roomName });
        }
    });

    socket.on(socketKeys.JoinTable, (data) => {
        if (listServer.has(data.roomId)) {
            const usr = listUsers.find(u => u.id === user.id);
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
            listServer.get(data.roomId).status = 'S';
            listServer.get(data.roomId).deck = createDeck(listServer.get(data.roomId).configs.nbDeck);
            // send in room including sender
            io.in(data.roomId).emit(socketKeys.StartGame, {
                table: listServer.get(data.roomId)
            });
        } else {
            // ERROR
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

/**
 * permet de mélanger le paquet de carte de façon aléatoire
 * @param {liste à mélanger} deck 
 */
const shuffleDeck = (deck) => {
    var j = 0;
    var valI = '';
    var valJ = valI;
    var l = deck.length - 1;
    while (l > -1) {
        j = Math.floor(Math.random() * l);
        valI = deck[l];
        valJ = deck[j];
        deck[l] = valJ;
        deck[j] = valI;
        l = l - 1;
    }
    return deck;
};

/**
 * Permet de générer un nombre X de paquet de carte
 * @param {Nombre de deck} nbDeck 
 */
const createDeck = (nbDeck = 1) => {
    const symbol = ['C', 'D', 'H', 'S'];
    const special = ['J', 'Q', 'K']
    let decks = [];
    for (let deck = 1; deck <= nbDeck; deck++) {
        for (let index = 1; index <= 13; index++) {
            for (let j = 0; j < symbol.length; j++) {
                if (index === 1) {
                    decks.push({deck: deck, name: 'A'+symbol[j], value: 1 | 10});
                } else if (index === 11) {
                    decks.push({deck: deck, name: 'J'+symbol[j], value: 10});
                } else if (index === 12) {
                    decks.push({deck: deck, name: 'Q'+symbol[j], value: 10});
                } else if (index === 13) {
                    decks.push({deck: deck, name: 'K'+symbol[j], value: 10});
                } else {
                    decks.push({deck: deck, name: index.toString() + symbol[j], value: index});
                }
            }
        }
    }
    return shuffleDeck(decks);
};
