import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss']
})
export class BlackjackComponent implements OnInit {

  createTable = false;
  username: string;

  formNewTable: FormGroup;

  private socket: any = null;

  listTables = [];
  constructor(private socketService: SocketBlackJackService) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    console.log(this.username);
    if (this.username) { this.initConnectionServer(); }
    // Creation du formulaire pour une nouvelle room
    this.formNewTable = new FormGroup({
      roomName: new FormControl('', Validators.required)
    });
  }

  private initConnectionServer() {
    this.socketService.setupSocketConnection(this.username);
    this.socket = this.socketService.socket;
    this.setupSocketConnection();
    setTimeout(() => {
      // this.listTables = this.socketService.listServers;
    }, 200);
  }

  onCreateRoom() {
    this.socketService.createNewLobby({
      roomName: this.formNewTable.value.roomName
    });
  }

  createUsername(username: string) {
    console.log(username);
    localStorage.setItem('username', username);
    this.username = username;
    this.initConnectionServer();
  }

  joinTable(table) {
    alert('You Join the table ' + table.id);
  }


  setupSocketConnection() {
    console.log(environment.SOCKET_ENDPOINT);
    // this.socket = io(environment.SOCKET_ENDPOINT, {
    //   query: {
    //     username: user,
    //     token: 'cde',
    //     oldSocket: this.socketService.getConnectionId()
    //   }
    // });
    this.socket.on('connected', data => {
      this.socketService.keepConnectionId(data.id);
      this.listTables = data.servers;
    });

    this.socket.on('update du jeu', (data: string) => {
      console.log(data);
    });

    this.socket.on('new lobby', data => {
      console.log(data);
    });

    this.socket.on('update lobbys', data => {
      console.log(data);
      this.listTables = data.servers;
    });
  }
}
