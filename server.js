
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
        socket.id = socket.handshake.query.oldSocket;
        user.id = socket.handshake.query.oldSocket;
    } else {
        listUsers.push(user)
    }
    console.log(listUsers);
    socket.emit('connected', {
        id: socket.conn.id,
        servers: extractServerName()
    });

    socket.on('new lobby', (data) => {
        const roomId = createRoomId(32) + socket.id;
        if (!listServer.has(roomId)) {
            const user = listUsers.find(u => u.id === socket.id);
            listServer.set(roomId, {id: roomId, name: data.roomName, users: [user], configs: null});
            io.to(socket.id).emit('new lobby', {
                roomId: roomId,
                roomName: data.roomName
            });
            socket.broadcast.emit('update lobbys', {
                servers: extractServerName()
            });
        } else {
            io.to(socket.id).emit('new lobby', {
                roomid: null,
                roomName: data.roomName
            });
        }
    });




    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const extractServerName = () => {
    var tmp = [];
    let keys = Array.from( listServer.keys() );
    for (const entry of listServer.entries()) {
        console.log(entry);
        console.log(entry['name'])
        tmp.push(entry.name);
    }
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
