// import { BaseResponse } from "../responses/base-response";
// import { ConnectedResponse, NewLobbyResponse, NewPlayerInGameResponse, KickedPlayerResponse, ListServerResponse } from "../responses/server-response";
// import Table from '../table';
// import BlackjackTable from "../../../modules/blackjack/models/blackjack-table";

// export class ServerManager {

//     constructor() {
//         this.serverList = new Map();
//         this.userList = [];
//         this.started = new Date(Date.now());
//         this.countConnectedUser = 0;
//     }

//     //#region Table
//     addTable(roomId, table) {
//         this.serverList.set(roomId, table);
//     }
//     removeTable(roomId) {
//         this.serverList.delete(roomId);
//         return this.createListServerResponse();
//     }
//     isTableExist(roomId) {
//         return this.serverList.has(roomId);
//     }

//     get servers() {
//         return Array.from(this.serverList.values());
//     }
//     //#endregion Table

//     //#region User
//     addUser(user) {
//         this.countConnectedUser++;
//         this.userList.push(user);
//     }

//     removeUser(user) {
//         this.countConnectedUser--;
//         this.userList.splice(this.userList.findIndex(u => u.id === user.id), 1);
//     }

//     get users() {
//         return this.userList.slice();
//     }

//     playerLeaveGame(roomId, userId) {
//         //TODO (copié collé de serveur je dois le réadapter) (Ligne 74)
//         const table = this.serverList.get(roomId);
//         const userIndex = table.players.findIndex(p => p.id === userId);
//         let response
//         if (table.currentPlayer === player.id && (userIndex + 1) < table.players.length) {
//             table.currentPlayer = table.players[userIndex + 1].id;
//             switch (table.type) {
//                 case tableType.Blackjack: {
//                     response = table.createResponse(nextPlayer);
//                     break;
//                 }
//             }
//         }
//         table.removePlayer(player);
//         response = table.leaveTable(player);
//         return response;
//     }
//     //#endregion User

//     /**
//      * This method allow to kick a player with his ID
//      * @param {*} playerToKickId 
//      */
//     kickPlayer(playerToKickId) {
//         const playerKicked = manager.userList.find(p => p.id === playerToKickId);
//         if (playerKicked) {
//             return this.createKickedPlayerResponse(playerKicked)
//         }
//     }

//     userInitConnection(user, socket) {
//         if (this.userList.find(p => p.id === socket.handshake.query.oldSocket)) {
//             socket.conn.id = socket.handshake.query.oldSocket;
//             user.id = socket.handshake.query.oldSocket;
//             this.userList.find(u => u.id === socket.handshake.query.oldSocket && u.name === socket.handshake.query.username).id = user.id;
//         } else {
//             this.addUser(user);
//         }
//     }

//     /**
//      * This method allow to create distinc Table with the tableType
//      * @param {*} tableType 
//      * @param {*} userId 
//      * @param {*} data 
//      */
//     createTable (tableType, userId, data) {
//         let table = null;
//         switch (tableType) {
//             case tableType.BLACKJACK: {
//                 table = new BlackjackTable(this.createServerId(32, userId),data.roomName, data.password, userId, data.difficulty);
//                 break;
//             }
//             default: { table = null; break; }
//         }
//         if (table) {
//             this.addTable(table.id, table)
//         }
//         return table;
//     }

//     /**
//      * This method allow to create a BaseResponse with an error message
//      * @param {*} message 
//      */
//     generateError(message) {
//         const error = new BaseResponse();
//         error.isSuccess = false;
//         error.errorMessage = message;
//         return error;
//     }

//     /**
//      * This method provide a solution to generate a unique ID for a table
//      * @param {*} length 
//      * @param {*} playerId 
//      */
//     createServerId(length = 64, playerId) {
//         let result = '';
//         const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//         const charactersLength = characters.length;
//         for (var i = 0; i < length; i++) {
//             result += characters.charAt(Math.floor(Math.random() * charactersLength));
//         }
//         return result + playerId;
//     }

//     /**
//      * This method allow to provide a resume page
//      * @param {*} process 
//      */
//     generateAdminPage(process) {
//         return `
//             <html><head></head><body>
//             UPTIME: ${Math.round(process.uptime())} secondes <br/>
//             UserConnected: ${this.countConnectedUser} <br/>
//             RoomCreated: ${this.servers.length}
//             </body></html>
//         `
//     }

//     //#region CREATE RESPONSE
//     createConnectedResponse(socketId) {
//         return new ConnectedResponse(socketId, this.servers);
//     }

//     createNewLobbyResponse(roomId, roomName) {
//         return new NewLobbyResponse(roomId, roomName);
//     }

//     createKickedPlayerResponse(playerKick) {
//         return new KickedPlayerResponse(playerKick);
//     }

//     createNewPlayerInGameResponse(userId, table) {
//         return new NewPlayerInGameResponse(userId, table);
//     }

//     createListServerResponse() {
//         return new ListServerResponse(this.servers);
//     }
//     //#endregion CREATE RESPONSE
// }

// module.exports = ServerManager;