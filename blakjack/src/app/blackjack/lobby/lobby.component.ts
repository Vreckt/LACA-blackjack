import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { Table } from 'src/app/shared/models/table';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  init = false;
  tableId = null;
  table = null;
  player = null;
  private socket: any = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketBlackJackService: SocketBlackJackService
    ) {
      this.route.paramMap.subscribe(params => {
        this.tableId = params.get('id');
      });
    }

  ngOnInit() {
    this.socket = this.socketBlackJackService.socket ? this.socketBlackJackService.socket : this.socketBlackJackService.getSocket();
    if (this.socket) {
      this.aftersocketInit();
    } else {
      this.socketBlackJackService.connectToSocket();
      this.socket = this.socketBlackJackService.socket;
      this.aftersocketInit();
    }
  }

  aftersocketInit() {
    if (this.socket) {
      this.setupSocketConnection();
      this.socket.emit('join table', {
        roomId: this.tableId
      });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  trigger() {
    this.socket.emit('trigger');
  }

  private manageUI(data) {
    this.table = data.table;
    const playerIndex = this.table.users.findIndex(user =>
      user.id === this.socketBlackJackService.getConnectionId() && user.name === localStorage.getItem('username')
    );
    this.player = this.table.users.splice(playerIndex, 1);
  }

  private setupSocketConnection() {

    this.socket.on('join table', data => {
      console.log(data);
      if (data.status === 'success') {
        this.manageUI(data);
        this.init = true;
      }
    });
    this.socket.on('trigger', () => {
      console.log('Trigger');
    });

    this.socket.on('player join', data => {
      if (data.status === 'success') {
        console.log('User Join!');
        this.manageUI(data);
      }
    });
  }

}
