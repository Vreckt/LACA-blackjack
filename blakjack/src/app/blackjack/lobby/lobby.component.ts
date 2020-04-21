import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { SocketKey } from '../../shared/models/enums/SocketKey';

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
  isAdmin = false;
  showTable = false;
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
      this.socket.emit(SocketKey.JoinTable, {
        roomId: this.tableId
      });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  private manageUI(data) {
    this.table = data.table;
    const playerIndex = this.table.users.findIndex(user =>
      user.id === this.socketBlackJackService.getConnectionId() && user.name === localStorage.getItem('username')
    );
    this.player = this.table.users.splice(playerIndex, 1)[0];
    console.log(this.player);
    if (this.table.id.includes(this.socketBlackJackService.getConnectionId())) {
      this.isAdmin = true;
    }
  }

  onStartGame() {
    alert('TODO START GAME');
    // this.showTable = true;
    this.socket.emit(SocketKey.StartGame, {
      roomId: this.table.id
    });
  }

  onRemovePlayer() {
    alert('TODO REMOVE PLAYER');
  }

  onLeaveTable() {
    // alert('TODO LEAVE TABLE');
    this.socket.emit(SocketKey.LeaveTable, {roomId: this.table.id});
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private setupSocketConnection() {
    this.socket.on(SocketKey.JoinTable, data => {
      if (data.status === 'success') {
        this.manageUI(data);
        this.init = true;
      }
    });


    this.socket.on(SocketKey.StartGame, data => {
      console.log(data);
    });

    this.socket.on(SocketKey.PlayerJoin, data => {

      if (data.status === 'success') {
        this.manageUI(data);
      }
    });
    this.socket.on(SocketKey.PlayerLeave, data => {
      if (data.status === 'success') {
        this.manageUI(data);
      }
    });
  }
}
