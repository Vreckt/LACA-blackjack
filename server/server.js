const environnement = require('./src/environments/environnement');
const pack = require('./package');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socketEnum = require('./src/app/shared/enums/socket-enum');
const tableType = require('./src/app/shared/enums/table-type-enum');

const Table = require('./src/app/shared/models/table');

//#region MANAGER
const ServerManager = require('./src/app/shared/models/managers/server-manager');
const manager = new ServerManager();
//#endregion MANAGER

//#region RESPONSE
const { ConnectedResponse, NewLobbyResponse } = require('./src/app/shared/models/responses/server-response');
//#endregion RESPONSE

app.get('/', (request, response) => response.end(manager.generateAdminPage(process)));
server.listen(environnement.port, () => console.log(`Version: ${pack.version}, Server listening at port ${environnement.port}`));

io.on(socketEnum.Connection, (socket) => {
    const user = socket.conn.id; // new Player(socket.conn.id, socket.handshake.query.username, socket.handshake.query.iconColor);
    manager.userInitConnection(user, socket);
    socket.emit(socketEnum.Connected, new ConnectedResponse(socket.conn.id, manager.servers));
    socket.on(socketEnum.Disconnect, () => manager.removeUser(user));

    /**
     * This socket is in progress
     */
    socket.on(socketEnum.CREATENEWGAME, (data) => {
        const roomId = manager.createServerId(32, player.id);
        if (roomId && !manager.serverList.has(roomId) && data && data.roomName && user.userId) {
            let table = null;
            switch (data.tableType) {
                case tableType.BLACKJACK: {
                    table = '' // TODO CREATE BLACKJACK TABLE
                    break;
                }
            }
            table = new Table(roomId, data.roomName, data.password, user.userId, data.difficulty);
            if (table) {
                manager.addTable(roomId, table);
                io.to(socket.id).emit(socketEnum.CREATENEWGAME, new NewLobbyResponse(roomId, data.roomName));
                socket.broadcast.emit(socketEnum.UPDATEGAME, manager.servers);
            } else {
                // Error Table null
            }
        } else {
            // Error Create Lobby
        }
    });

    socket.on(socketEnum.JOINGAME, (data) => {
        if (manager.serverList.has(data.roomId)) {
            let table = listServer.get(data.roomId);
            if (!table.hasPlayer(player.id)) {
                // TODO ADD PLAYER IN GAME
                const response = '';// TODO CREATE RESPONSE
                socket.join(data.roomId);
                socket.to(data.roomId).emit(socketEnum.PLAYERJOIN, response);
                io.to(socket.id).emit(socketEnum.JOINGAME, response);
            } else {
                // Error player already in game
            }
        } else {
            // Error table not exist
        }
    });

});
