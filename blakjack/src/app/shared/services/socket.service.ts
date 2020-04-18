import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  socket;

  constructor() { }

  setupSocketConnection() {
    console.log(environment.SOCKET_ENDPOINT);
    this.socket = io(environment.SOCKET_ENDPOINT);
  }
}
