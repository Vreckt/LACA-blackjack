import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketKey } from '../../../shared/models/enums/SocketKey';

@Component({
  selector: 'app-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss']
})
export class BlackjackComponent implements OnInit {

  createTable = false;
  username: string;
  icon = 1;
  formNewTable: FormGroup;
  listTables = [];

  constructor(
    private socketService: SocketBlackJackService,
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    this.icon = +localStorage.getItem('iconColor');
    if (!this.socketService.socket) {
      this.socketService.connectToSocket();
    }
    if (this.username) {
      this.setupSocketConnection();
    } else {
      this.router.navigate(['../connection'], { relativeTo: this.route });
    }
    this.formNewTable = new FormGroup({
      roomName: new FormControl('', Validators.required)
    });
    console.log(this.socketService.listServers);
    setTimeout(() => {
      this.listTables = this.socketService.listServers;
    }, 100);
  }

  onCreateRoom() {
    this.socketService.createNewLobby({
      roomName: this.formNewTable.value.roomName
    });
  }

  joinTable(table) {
    this.router.navigate([table.id], { relativeTo: this.route });
  }

  private setupSocketConnection() {
    this.socketService.socket.on(SocketKey.Connected, data => {
      this.socketService.keepConnectionId(data.id);
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });

    this.socketService.socket.on(SocketKey.NewLobby, data => {
      this.router.navigate([data.roomId], { relativeTo: this.route });
    });

    this.socketService.socket.on(SocketKey.UpdateLobby, data => {
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });
  }
}
