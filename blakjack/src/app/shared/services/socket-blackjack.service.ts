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
    this.socket = io(environment.SOCKET_ENDPOINT, {
      query: {
        username: user,
        token: 'cde',
        oldSocket: this.getConnectionId()
      }
    });
  }

  createNewLobby(data: any) {
    this.socket.emit(SocketKey.NewLobby, data);
  }

  keepConnectionId(connId: string) {
    if (!this.getConnectionId()) {
      localStorage.setItem('connId', connId);
    }
  }

  getConnectionId() {
    return localStorage.getItem('connId');
  }

  keepSocket(connId) {
      localStorage.setItem('socket', connId);
  }

  getSocket() {
    localStorage.getItem('socket');
  }

}
