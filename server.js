
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
    serveClient: false,
  // below are engine.IO options
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

    let user = {id: socket.conn.id, name: socket.handshake.query.username};

    if (listUsers.find(u =>  u.id === socket.handshake.query.oldSocket && u.name === u.name)) {
        console.log('oldUser');
        socket.conn.id = socket.handshake.query.oldSocket;
        user.id = socket.handshake.query.oldSocket;
        for (const usr of listUsers) {
            if (usr.id === socket.handshake.query.oldSocket && usr.name === socket.handshake.query.username) {
                usr.id = user.id;
            }
        }
    } else {
        console.log('newUser');
        listUsers.push(user)
    }


    socket.emit('connected', {
        id: socket.conn.id,
        servers: extractServerName()
    });

    socket.on('new lobby', (data) => {
        const roomId = createRoomId(32) + user.id;
        console.log('new lobby : ', data );
        console.log('new lobby : ', roomId );
        if (!listServer.has(roomId)) {
            console.log('new lobby : ', 'in IF' );
            listServer.set(roomId, {id: roomId, name: data.roomName, users: [], configs: null});
            io.to(socket.id).emit('new lobby', {
                roomId: roomId,
                roomName: data.roomName
            });
            socket.broadcast.emit('update lobbys', {
                servers: extractServerName()
            });
        } else {
            console.log('new lobby : ', 'in ELSE' );
            io.to(socket.id).emit('new lobby', {
                roomid: null,
                roomName: data.roomName
            });
        }
    });

    socket.on('join table', (data) => {
        console.log("before IF")
        if (listServer.has(data.roomId)) {
            console.log("in IF")
            const usr = listUsers.find(u => u.id === user.id);
            console.log(usr);
            if (!listServer.get(data.roomId).users.find(u => u.id === usr.id)){
                console.log("in second IF")
                listServer.get(data.roomId).users.push(usr);
                console.log('join table user id : ', user.id);
                socket.to(data.roomId).emit('player join', "JOIN");
            }
            socket.join(data.roomId);
            io.to(socket.id).emit('join table', {
                table: listServer.get(data.roomId),
                status: 'success'
            });
            console.log("out second IF")
        } else {
            console.log("in ELSE")
            io.to(socket.id).emit('join table', {
                table: null,
                status: 'error'
            });
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
