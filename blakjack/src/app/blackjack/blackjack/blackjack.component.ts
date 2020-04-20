import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketKey } from '../../shared/models/enums/SocketKey';

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
    this.router.navigate([table.id], { relativeTo: this.route });
  }


  private setupSocketConnection() {
    this.socket.on(SocketKey.Connected, data => {
      this.socketService.keepConnectionId(data.id);
      this.socketService.keepSocket(this.socket);
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });

    this.socket.on(SocketKey.NewLobby, data => {
      console.log(data.roomId);
      console.log(data);
      this.router.navigate([data.roomId], { relativeTo: this.route });
    });

    this.socket.on(SocketKey.UpdateLobby, data => {
      console.log(data);
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });
  }
}
