import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  constructor(
    private socketService: SocketBlackJackService,
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    if (this.username) { this.initConnectionServer(); }
    this.formNewTable = new FormGroup({
      roomName: new FormControl('', Validators.required)
    });
  }

  private initConnectionServer() {
    this.socketService.connectToSocket();
    this.socket = this.socketService.socket;
    this.setupSocketConnection();
  }

  onCreateRoom() {
    this.socketService.createNewLobby({
      roomName: this.formNewTable.value.roomName
    });
  }

  createUsername(username: string) {
    localStorage.setItem('username', username);
    this.username = username;
    this.initConnectionServer();
  }

  joinTable(table) {
    alert('You Join the table ' + table.id);
  }


  private setupSocketConnection() {
    this.socket.on('connected', data => {
      this.socketService.keepConnectionId(data.id);
      this.socketService.keepSocket(this.socket);
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });

    this.socket.on('new lobby', data => {
      console.log(data.roomId);
      console.log(data);
      this.router.navigate([data.roomId], { relativeTo: this.route });
    });

    this.socket.on('update lobbys', data => {
      console.log(data);
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });
  }
}
