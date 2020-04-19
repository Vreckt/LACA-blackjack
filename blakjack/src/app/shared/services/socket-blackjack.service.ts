import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketBlackJackService {
  socket: any = null;

  listServers = [];

  constructor() { }

  setupSocketConnection(user: string) {
    // console.log(environment.SOCKET_ENDPOINT);
    this.socket = io(environment.SOCKET_ENDPOINT, {
      query: {
        username: user,
        token: 'cde',
        oldSocket: this.getConnectionId()
      }
    });
    // this.socket.on('connected', data => {
    //   this.keepConnectionId(data.id);
    //   this.listServers = data.servers;
    // });

    // this.socket.on('update du jeu', (data: string) => {
    //   console.log(data);
    // });

    // this.socket.on('new lobby', data => {
    //   console.log(data);
    // });

    // this.socket.on('update lobbys', data => {
    //   console.log(data);
    //   // this.listServers = data
    // });
  }

  createNewLobby(data: any) {
    this.socket.emit('new lobby', data);
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
