const environnement = require('./src/environments/environnement');
const package = require('./package');
const express = require('express');
const { Server } = require('http');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(environnement.port, () => {
    console.log(`Version: ${package.version}, Server listening at port ${environnement.port}`);
});

io.on('init', (socket) => { });