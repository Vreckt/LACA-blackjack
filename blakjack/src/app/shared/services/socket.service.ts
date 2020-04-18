import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: any = null;

  listServers = [];

  constructor() { }

  setupSocketConnection() {
    console.log(environment.SOCKET_ENDPOINT);
    this.socket = io(environment.SOCKET_ENDPOINT, {
      query: {
        token: 'cde',
        oldSocket: this.getConnectionId()
      }
    });
    this.socket.on('connected', data => {
      console.log(data);
      this.keepConnectionId(data.id);
      this.listServers = data.servers;
    });

    this.socket.on('trigger', (data: string) => {
      console.log(data);
    });

    this.socket.on('update du jeu', (data: string) => {
      console.log(data);
    });


  }

  triggerServer() {
    this.socket.emit('trigger');
  }

  keepConnectionId(connId: string) {
    if (!this.getConnectionId()) {
      localStorage.setItem('connId', connId);
    }
  }

  getConnectionId() {
    return localStorage.getItem('connId');
  }

}
