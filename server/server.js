const environnement = require('./src/environments/environnement');
const package = require('./package');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socketEnum = require('./src/app/shared/enums/socket-enum');

//#region MANAGER
const ServerManager = require('./src/app/shared/models/managers/server-manager');
const manager = new ServerManager();
//#endregion MANAGER

//#region RESPONSE
const { ConnectedResponse, NewLobbyResponse } = require('./src/app/shared/models/responses/server-response');
//#endregion RESPONSE

app.get('/', (request, response) => response.end(manager.generateAdminPage(process)));
server.listen(environnement.port, () => console.log(`Version: ${package.version}, Server listening at port ${environnement.port}`));

io.on(socketEnum.Connection, (socket) => {
    const user = socket.conn.id; // new Player(socket.conn.id, socket.handshake.query.username, socket.handshake.query.iconColor);
    manager.userInitConnection(user, socket);
    socket.emit(socketEnum.Connected, new ConnectedResponse(socket.conn.id, manager.servers));
    socket.on(socketEnum.Disconnect, () => manager.removeUser(user));

    /**
     * This socket is in progress
     */
    // socket.on(socketKeys.NewLobby, (data) => {
    //     const roomId = manager.createServerId(32, player.id);
    //     if (!manager.servers.has(roomId)) {
    //         // TODO CREATE TABLE
    //         manager.addTable(roomId, table);
    //         io.to(socket.id).emit(socketKeys.NewLobby, new NewLobbyResponse(roomId, data.roomName));
    //         socket.broadcast.emit(socketKeys.UpdateLobby, manager.servers);
    //     }
    // });
});
