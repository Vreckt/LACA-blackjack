import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { SocketKey } from '../models/enums/SocketKey';

@Injectable({
  providedIn: 'root'
})
export class SocketBlackJackService {
  socket: any = null;

  listServers = [];

  constructor() { }

  connectToSocket() {
    const user = localStorage.getItem('username');
    const iconColor = localStorage.getItem('iconColor');
    this.socket = io(environment.SOCKET_ENDPOINT, {
      query: {
        username: user,
        iconColor: +iconColor,
        token: 'cde',
        oldSocket: this.getConnectionId(),
      }
    });
  }

  createNewLobby(data: any) {
    this.socket.emit(SocketKey.NewLobby, data);
  }

  keepConnectionId(connId: string) {
    if (this.getConnectionId() !== connId) {
      console.log(connId);
      localStorage.setItem('connId', connId);
    }
  }

  getConnectionId() {
    return localStorage.getItem('connId');
  }
}
