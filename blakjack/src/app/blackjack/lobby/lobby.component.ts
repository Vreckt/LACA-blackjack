import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { SocketKey } from '../../shared/models/enums/SocketKey';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  enableActionBtn = false;
  showTable = false;
  private socket: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketBlackJackService: SocketBlackJackService,
    private snackBar: MatSnackBar
    ) {
      this.route.paramMap.subscribe(params => {
        this.tableId = params.get('id');
      });
    }

  ngOnInit() {
    this.socket = this.socketBlackJackService.socket ? this.socketBlackJackService.socket : '';
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
    this.table = JSON.parse(JSON.stringify(data.table));
    this.showTable = this.table.status === 'S' ? true : false;
    const playerIndex = this.table.users.findIndex(user =>
      user.id === this.socketBlackJackService.getConnectionId() && user.name === localStorage.getItem('username')
    );
    console.log(playerIndex);
    this.player = this.table.users.splice(playerIndex, 1)[0];


    this.enableActionBtn = !(this.player.id === data.table.currentPlayer);

    if (this.table.id.includes(this.socketBlackJackService.getConnectionId())) {
      this.isAdmin = true;
    }
  }

  onStartGame() {
    this.socket.emit(SocketKey.StartGame, {
      roomId: this.table.id
    });
  }

  onRemovePlayer(id: string) {
    this.socket.emit(SocketKey.PlayerKick, {
      roomId: this.table.id,
      currentPlayerId: this.player.id,
      kickPlayerId: id
    });
  }

  drawCard() {
    this.socket.emit(SocketKey.DrawCard, ({
      roomId: this.tableId,
      userId: this.player.id
    }));
  }

  doubleCredits() {

  }

  endRound() {
    this.socket.emit('EndTurn', {
      roomId: this.tableId,
      userId: this.player.id
    });
  }

  onLeaveTable() {
    // alert('TODO LEAVE TABLE');
    this.socket.emit(SocketKey.LeaveTable, {roomId: this.table.id});
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  showRoundPlayer(user: string) {
    this.snackBar.open('A ' + user + ' de jouer !', null, {
      duration: 1500,
    });
  }

  private setupSocketConnection() {
    this.socket.on(SocketKey.JoinTable, data => {
      console.log(data);
      if (data.status === 'success') {
        this.manageUI(data);
        this.init = true;
      }
    });

    this.socket.on(SocketKey.PlayerJoin, data => {
      console.log(data);
      if (data.status === 'success') {
        this.manageUI(data);
      }
    });

    this.socket.on(SocketKey.PlayerLeave, data => {
      if (data.status === 'success') {
        this.manageUI(data);
      }
    });

    this.socket.on('bankShowCard', data => {
      this.table.bank = data.table.bank;
    });

    this.socket.on('bankDrawCard', data => {
      this.table.bank = data.table.bank;
    });

    this.socket.on(SocketKey.TurnPlayer, data => {
      console.log(data);
      this.manageUI(data);
      const tmpuser = data.table.users.find(u => u.id === data.userId);
      console.log(tmpuser);
      this.showRoundPlayer(tmpuser.name);
    });

    this.socket.on(SocketKey.StartGame, data => {
      console.log(data);
      this.showTable = true;
      this.player = data.table.users.find(p => p.id === this.player.id);
      this.enableActionBtn = !(this.player.id === data.currentPlayer);
      this.manageUI(data);
    });

    this.socket.on(SocketKey.DrawCard, data => {
      console.log(data);
      this.manageUI(data);
    });

     this.socket.on(SocketKey.PlayerKick, data => {
      console.log(data.kickPlayer);
      if (this.player.id === data.kickPlayer.id) {
        this.onLeaveTable();
        alert('Vous avez été kické par l\'admin');
      } else {
        alert('Le joueur ' + data.kickPlayer.name + ' a été expulsé du lobby par l\'admin');
      }

    });
  }
}
