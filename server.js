var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port =  8081;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.send('<h1>BlackJack Server</h1>');
});

let listServer = new Map();

io.sockets.on('connection', (socket) => {
    console.log('User connected !');


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
