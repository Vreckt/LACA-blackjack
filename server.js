
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

    let user = {id: socket.conn.id, name: 'User-'+socket.conn.id};

    if (listUsers.find(u =>  u.id === socket.handshake.query.oldSocket && u.name === u.name)) {
        socket.id = socket.handshake.query.oldSocket;
        user.id = socket.handshake.query.oldSocket;
    } else {
        listUsers.push(user)
    }
    console.log(listUsers);
    socket.emit('connected', {id: socket.conn.id, servers: listUsers});

    socket.on('trigger', () => {
        console.log('trigger');
        console.log(socket.id);
        io.emit('update du jeu', 'Le jeu est actualisé !');
        // io.to(socket.id).emit('trigger', 'Bonjour à toi!'); // envoie à une seule personne
        // io.emit('trigger', 'Bonjour à toi!'); // envoie à tout le monde sender compris
        // socket.broadcast.emit('trigger', 'Bonjour à toi!'); // envoie à tout le monde sender exclus
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


const createRoomId = (length = 64) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
