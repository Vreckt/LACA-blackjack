// import express = require('express');
// const app: express.Application = express();
// import { environment } from './src/environments/environnement';
// import pack from './package.json';

// import { SocketEnum } from './src/app/shared/enums/socket-enum';
// //#region MANAGER
// import { ServerManager } from './src/app/shared/models/managers/server-manager';
// import { ErrorEnum } from './src/app/shared/enums/error-enum';
// const manager = new ServerManager();
// //#endregion MANAGER

// const server = require('http').createServer(app);
// const io = require('socket.io')(server);

// app.get('/', (req, res) => res.end());
// server.listen(environment.port, () => console.log(`Version: ${pack.version}, Server listening at port ${environment.port}`));


// io.on(SocketEnum.Connection, (socket: any) => {
//     const user = socket.conn.id; // new Player(socket.conn.id, socket.handshake.query.username, socket.handshake.query.iconColor);
//     // manager.userInitConnection(user, socket);
//     // manager.createConnectedResponse(socket.conn.id)
//     socket.emit(SocketEnum.Connected);
//     // socket.on(SocketEnum.Disconnect, () => "");

//     socket.on(SocketEnum.CREATENEWGAME, (data) => {
//         // if (data && data.roomName && user.userId) {
//         //     const table = manager.createTable(data.tableType, user.userId, data);
//         //     if (table) {
//         //         // , manager.createNewLobbyResponse(table.id, data.roomName)
//         //         io.to(socket.id).emit(SocketEnum.CREATENEWGAME);
//         //         socket.broadcast.emit(SocketEnum.UPDATEGAME, manager.servers);
//         //     } else {
//         //         io.to(socket.id).emit(SocketEnum.Error, manager.generateError(ErrorEnum.ERRORNOTABLEFOUND));
//         //     }
//         // } else {
//         //     io.to(socket.id).emit(SocketEnum.Error, manager.generateError(ErrorEnum.ERRORCREATELOBBY));
//         // }
//     });

//     socket.on(SocketEnum.JOINGAME, (data) => {
//         // if (manager.isTableExist(data.roomId)) {
//         //     const table = manager.serverList.get(data.roomId);
//         //     if (!table.hasPlayer(user.id)) {
//         //         // TODO ADD PLAYER IN GAME
//         //         const response = ''; // TODO CREATE RESPONSE
//         //         socket.join(data.roomId);
//         //         socket.to(data.roomId).emit(SocketEnum.PLAYERJOIN, response);
//         //         io.to(socket.id).emit(SocketEnum.JOINGAME, response);
//         //     } else {
//         //         io.to(socket.id).emit(SocketEnum.Error, manager.generateError(ErrorEnum.ERRORPLAYERALREADYINGAME));
//         //     }
//         // } else {
//         //     io.to(socket.id).emit(SocketEnum.Error, manager.generateError(ErrorEnum.ERRORNOTABLEFOUND));
//         // }
//     });

//     socket.on(SocketEnum.KICKPLAYER, (data) => {
//         // if (data && data.roomId && data.currentPlayerId && data.kickPlayerId) {
//         //     if (manager.serverList.get(data.roomId).adminId === data.currentPlayerId) {
//         //         io.to(data.roomId).emit(SocketEnum.KICKPLAYER, manager.kickPlayer(data.kickPlayerId));
//         //     }
//         // }
//     });

//     //TODO
//     /* socket.on(socketKeys.LEAVEGAME, (data) => {
//         if (manager.isTableExist(data.roomId)) {
//             let response = new ServerResponse(table, player.id); // a déplacer dans l'objet Table dans leave ?
//             socket.leave(data.roomId);
//             if (manager.serverList.get(data.roomId).players.length === 1) {
//                 socket.broadcast.emit(socketKeys.UpdateLobby, manager.removeTable(data.roomId));
//             } else {
//                 socket.to(data.roomId).emit(socketKeys.PlayerLeave, manager.playerLeaveGame(data.roomId, player.id));
//             }
//         }
//     });

//     socket.on(socketKeys.Action, (data) => {
//         if (listServer.has(data.roomId)) {
//             let table = listServer.get(data.roomId);
//             const playerIndex = table.players.findIndex(p => p.id === data.playerId);
//             switch (data.actionKeys) {
//                 case socketKeys.DrawCard: {
//                     if (table.hasPlayer(data.playerId)) {
//                         response = table.drawCard(playerIndex);
//                         table.setScoreToPlayer(playerIndex, response.point);
//                         io.in(data.roomId).emit(socketKeys.DrawCard, response);
//                     }
//                     break;
//                 }
//                 case socketKeys.PlayerDouble: {
//                     if (table.hasPlayer(data.playerId)) {
//                         let response = table.doubleBet(playerIndex, table.players[playerIndex]);
//                         table.setScoreToPlayer(playerIndex, response.point);
//                         listServer.set(data.roomId, table);
//                         io.in(data.roomId).emit(socketKeys.PlayerBet, response);
//                     }
//                     break;
//                 }
//                 case socketKeys.PlayerBet: {
//                     if (table.hasPlayer(data.playerId)) {
//                         if (data.betMoney > 0 && data.betMoney <= table.players[playerIndex].credits) {
//                             io.in(data.roomId).emit(socketKeys.PlayerBet, table.playerBet(data.betMoney, playerIndex));
//                             if (table.isPlayersAllBet()) {
//                                 table.startedTable();
//                                 table.deck = new decks.StandardDeck({ nbDeck: table.difficulty });
//                                 table.deck.shuffleAll();
//                                 for (let i = 0; i < 2; i++) {
//                                     setTimeout(() => {
//                                         for (let p = 0; p <= table.players.length; p++) {
//                                             setTimeout(() => {
//                                                 if (p !== table.players.length) {
//                                                     const response = table.drawCard(p);
//                                                     table.setScoreToPlayer(p, response.point);
//                                                     io.in(data.roomId).emit(socketKeys.DrawCard, response);
//                                                 } else {
//                                                     const response = table.drawCard(table.bank, true);
//                                                     if (table.bank.hand.length > 1) {
//                                                         table.bank.hand[1].visible = false;
//                                                     }
//                                                     io.in(data.roomId).emit(socketKeys.DrawCard, response);
//                                                 }
//                                             }, p * 1300);
//                                         }
//                                     }, i * 1300 * (table.players.length + 1));
//                                 }
//                                 setTimeout(() => {
//                                     table.setCurrentPlayerTurn(table.players[0].id);
//                                     io.in(data.roomId).emit(socketKeys.PlayerTurn, table.createResponse(table.players[0]));
//                                 }, (table.players.length + 1) * 2600);
//                             }
//                         } else {
//                             console.log('info-playerNoMoney');
//                         }
//                     }
//                     break;
//                 }
//                 case socketKeys.PlayerEnd: {
//                     if (table.players.findIndex(p => p.id === data.playerId) === (table.players.length - 1)) {
//                         let response = table.calculateHand(table.bank);
//                         io.in(data.roomId).emit(socketKeys.BankShowCard, table.playerEnds(response));
//                         if (response.point < 17) {
//                             const drawedCards = table.bankEndDraw(response.point);
//                             for (let i = 2; i < drawedCards.length; i++) {
//                                 setTimeout(() => {
//                                     if (i === drawedCards.length - 1) {
//                                         response.table = table.manageEndGame();
//                                         io.in(data.roomId).emit(socketKeys.FinishGame, response);
//                                     } else {
//                                         io.in(data.roomId).emit(socketKeys.BankDrawCard, table.bankDrawCard(drawedCards[i]));
//                                     }
//                                 }, i * 1000);
//                             }
//                         } else {
//                             response.table = table.manageEndGame();
//                             io.in(data.roomId).emit(socketKeys.FinishGame, response);
//                             console.log("Finish game with no cards draw by the bank");
//                         }

//                     } else {
//                         const { nextPlayer, nextPlayerIndex } = table.getNextPlayer(player.id);
//                         const response = table.calculateHand(nextPlayer);
//                         response.table = table;
//                         if (nextPlayer.hand.length === 0) {
//                             response.table = table.manageEndGame();
//                             io.in(data.roomId).emit(socketKeys.FinishGame, response);
//                         } else {
//                             table.currentPlayer = nextPlayer.id;
//                             listServer.set(data.roomId, table);
//                             response.table = listServer.get(data.roomId);
//                             io.in(data.roomId).emit(socketKeys.PlayerTurn, response);
//                         }
//                     }
//                     break;
//                 }
//                 default:
//                     break;
//             }
//         }
//     }); */

//     // socket.on(socketKeys.Trigger, () => {
//     //     io.to(socket.id).emit('trigger');
//     // });

// });