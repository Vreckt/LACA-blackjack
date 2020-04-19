const User = require('./user')
const Table = require('./table');
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

io.sockets.on('connection', (socket) => {
    console.log('User connected !');

    let user = new User(socket.conn.id, socket.handshake.query.username)

    if (listUsers.find(u =>  u.id === socket.handshake.query.oldSocket && u.name === socket.handshake.query.username)) {
        socket.conn.id = socket.handshake.query.oldSocket;
        user.id = socket.handshake.query.oldSocket;
        for (const usr of listUsers) {
            if (usr.id === socket.handshake.query.oldSocket && usr.name === socket.handshake.query.username) {
                usr.id = user.id;
            }
        }
    } else {
        listUsers.push(user);
    }

    socket.emit('connected', {
        id: socket.conn.id,
        servers: extractServerName()
    });

    socket.on('new lobby', (data) => {
        const roomId = createRoomId(32) + user.id;
        // && listServer.get(roomId).users.length < 7
        if (!listServer.has(roomId)) {
            listServer.set(roomId, new Table(roomId, data.roomName, null));
            io.to(socket.id).emit('new lobby', { roomId: roomId, roomName: data.roomName});
            socket.broadcast.emit('update lobbys', { servers: extractServerName() });
        } else {
            // Error
            io.to(socket.id).emit('new lobby', { roomid: null, roomName: data.roomName });
        }
    });

    socket.on('join table', (data) => {
        if (listServer.has(data.roomId)) {
            const usr = listUsers.find(u => u.id === user.id);
            if (!listServer.get(data.roomId).users.find(u => u.id === usr.id)){
                listServer.get(data.roomId).users.push(usr);
                socket.to(data.roomId).emit('player join', {
                    table: listServer.get(data.roomId),
                    status: 'success'
                });
            }
            socket.join(data.roomId);
            io.to(socket.id).emit('join table', {
                table: listServer.get(data.roomId),
                status: 'success'
            });
        } else {
            // Error
            io.to(socket.id).emit('join table', { table: null, status: 'error'});
        }
    });

    socket.on('trigger', () => {
        io.to(socket.id).emit('trigger');
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const extractServerName = () => {
    return Array.from( listServer.values());
}

const createRoomId = (length = 64) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
