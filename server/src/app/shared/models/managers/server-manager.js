const { BaseResponse } = require("../responses/base-response");
const { 
    ConnectedResponse,
    NewLobbyResponse,
    NewPlayerInGame
} = require("../responses/server-response");
const Table = require('../table');

class ServerManager {

    constructor() {
        this.serverList = new Map();
        this.userList = [];
        this.started = new Date(Date.now());
        this.countConnectedUser = 0;
    }

    addTable(roomId, table) {
        this.serverList.set(roomId, table);
    }

    removeTable(table) {
        this.serverList = [];
    }

    isTableExist(roomId) {
        return this.serverList.has(roomId);
    }

    get servers() {
        return Array.from(this.serverList.values());
    }

    addUser(user) {
        this.countConnectedUser++;
        this.userList.push(user);
    }

    userInitConnection(user, socket) {
        if (this.userList.find(p => p.id === socket.handshake.query.oldSocket)) {
            socket.conn.id = socket.handshake.query.oldSocket;
            user.id = socket.handshake.query.oldSocket;
            this.userList.find(u => u.id === socket.handshake.query.oldSocket && u.name === socket.handshake.query.username).id = user.id;
        } else {
            this.addUser(user);
        }
    }

    removeUser(user) {
        this.countConnectedUser--;
        // this.addUser.push(user);
    }

    get users() {
        return this.userList.slice();
    }

    generateAdminPage(process) {
        return `
            <html><head></head><body>
            UPTIME: ${Math.round(process.uptime())} secondes <br/>
            UserConnected: ${this.countConnectedUser} <br/>
            RoomCreated: ${this.servers.length}
            </body></html>
        `
    }

    createServerId(length = 64, playerId) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result + playerId;
    }

    generateError(message) {
        const error = new BaseResponse();
        error.isSuccess = false;
        error.errorMessage = message;
        return error;
    }

    kickPlayer(playerToKickId) {
        const playerKicked = manager.userList.find(p => p.id === playerToKickId);
        if (playerKicked) {
            return this.createKickedPlayerResponse(playerKicked)
        }
    }

    createTable (tableType, userId, data) {
        let table = null;
        switch (tableType) {
            case tableType.BLACKJACK: {
                table = new Table(this.createServerId(32, userId), userId, data.roomName, data.password, data.difficulty);
                break;
            }
            default: { table = null; break; }
        }
        if (table) {
            this.addTable(table.id, table)
        }
        return table;
    }
    //#region CREATE RESPONSE
    createConnectedResponse(socketId) {
        return new ConnectedResponse(socketId, this.servers);
    }

    createNewLobbyResponse(roomId, roomName) {
        return new NewLobbyResponse(roomId, roomName);
    }

    createKickedPlayerResponse(playerKick) {
        return new NewLobbyResponse(playerKick);
    }

    createNewPlayerInGameResponse(userId, table) {
        return new NewPlayerInGame(userId, table);
    }
    //#endregion CREATE RESPONSE
}

module.exports = ServerManager;