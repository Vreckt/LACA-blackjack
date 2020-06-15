import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { SocketKey } from '../../../shared/models/enums/SocketKey';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogRetryComponent } from './dialogRetry/dialog.retry.component';
import { MatDialog } from '@angular/material/dialog';
import { TableComponent } from './dialogTable/table.component';
 
@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  BETUMBER_ALLOWED_CHARS_REGEXP = /[0-9\/]+/;

  icon = 1;
  init = false;
  tableId = null;
  table = null;
  player = null;
  isAdmin = false;
  enableDrawBtn = false;
  enableEndTurn = false;
  enableDoubleBtn = false;
  showTable = false;
  showBet = false;
  canBetButton = false;
  betAmount = 0;
  isBetAmountCorrect = this.betAmount > 0 && this.betAmount <= this.player.credits;

  message = 'Welcome !';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketBlackJackService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
    ) {
      this.route.paramMap.subscribe(params => {
        this.tableId = params.get('id');
      });
    }

  ngOnInit() {
  this.icon = +localStorage.getItem('iconColor');
    if (this.socketService.socket) {
      this.aftersocketInit();
    } else {
      this.socketService.connectToSocket();
      if (!localStorage.getItem('username') || !this.socketService.socket) {
        sessionStorage.setItem('inviteTo', 'blackjack/' + this.tableId);
        this.router.navigate(['./connection']);
      } else {
        this.aftersocketInit();
      }
    }
  }

  aftersocketInit() {
    if (this.socketService.socket) {
      this.setupSocketConnection();
      if (!localStorage.getItem('username')) {
        const pseudo = prompt('Pseudo');
        localStorage.setItem('username', pseudo);
        this.socketService.socket.emit(SocketKey.JoinTable, {
          roomId: this.tableId
        });
      } else {
        this.socketService.socket.emit(SocketKey.JoinTable, {
          roomId: this.tableId
        });
      }
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  private manageUI(data) {
    this.table = JSON.parse(JSON.stringify(data.table));
    this.showTable = this.table.status === 'S' || this.table.status === 'B' || this.table.status === 'F';
    const playerIndex = this.table.players.findIndex(player =>
      player.id === this.socketService.getConnectionId() && player.name === localStorage.getItem('username')
    );
    console.log(playerIndex);
    this.player = this.table.players.splice(playerIndex, 1)[0];
    const isMyTurn = this.player.id === data.playerId;
    this.enableDrawBtn = data.isShownDrawButton && isMyTurn;
    this.enableEndTurn = isMyTurn && this.table.status === 'S';
    this.enableDoubleBtn = data.isShownDoubleButton && isMyTurn;
    console.log("data MANAGE UI ", data);
    console.log("isMyTurn", isMyTurn);
    console.log("this.player.id", this.player.id);
    console.log("data.playerId", data.playerId);
    this.showBet = this.table.status === 'B' && this.player.currentBet === 0;
    this.canBetButton = this.showBet;

    if (this.table.id.includes(this.socketService.getConnectionId()) || this.table.adminId === this.socketService.getConnectionId()) {
      this.isAdmin = true;
    }
  }

  onStartGame() {
    this.socketService.socket.emit(SocketKey.StartGame, {
      roomId: this.table.id
    });
  }

  onRemovePlayer(id: string) {
    this.socketService.socket.emit(SocketKey.PlayerKick, {
      roomId: this.table.id,
      currentPlayerId: this.player.id,
      kickPlayerId: id
    });
  }

  drawCard() {
    // this.socketService.socket.emit(SocketKey.DrawCard, ({
    //   roomId: this.tableId,
    //   playerId: this.player.id
    // }));
    this.socketService.socket.emit(SocketKey.Action, ({
      actionKeys: SocketKey.DrawCard,
      roomId: this.tableId,
      playerId: this.player.id
    }));
  }

  // Bet

  sendBet() {
    if (this.canBetButton && this.isBetAmountCorrect) {
      this.canBetButton = false;
      console.log(this.betAmount);
      this.socketService.socket.emit(SocketKey.PlayerBet, {
        roomId: this.tableId,
        playerId: this.player.id,
        betMoney: this.betAmount
      });
    }
  }

  doubleBet() {
    this.enableDrawBtn = false;
    this.socketService.socket.emit(SocketKey.PlayerDouble, {
      roomId: this.tableId,
      playerId: this.player.id
    });
  }

  endRound() {
    this.socketService.socket.emit(SocketKey.PlayerEnd, {
      roomId: this.tableId,
      playerId: this.player.id
    });
  }

  onLeaveTable() {
    this.socketService.socket.emit(SocketKey.LeaveTable, {roomId: this.table.id});
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  showRoundPlayer(username: string) {
    this.message = 'A ' + username + ' de jouer !';
  }

  showBetPlayer(username: string, betMoney: string) {
    this.snackBar.open(username + ' a misé ' + betMoney + '€', null, {
      duration: 1500,
      verticalPosition: 'top'
    });
  }

  private manageEndGame(data) {
    console.log("manageEndGame");
    this.betAmount = 0;
    const listPlayers = [];
    for (const player of data.table.players) {
      listPlayers.push({
        username: player.name,
        point: player.score,
        status: false,
        credits: +player.currentBet
      });
    }
    const dialog = this.dialog.open(TableComponent, {
      width: '50%',
      disableClose: true,
      data :
      {
        score: listPlayers,
        admin: this.isAdmin
      }
    });
    dialog.afterClosed().subscribe(result => {
      if (result === 'restart') {
        this.onStartGame();
      } else if (result === 'leave') {
        this.onLeaveTable();
      } else {
        dialog.close();
      }
    });
  }

  private setupSocketConnection() {

    this.socketService.listen(SocketKey.JoinTable).subscribe((data: any) => {
      console.log(data)
      this.manageUI(data);
      this.init = true;
    });

    this.socketService.listen(SocketKey.PlayerJoin).subscribe((data: any) => {
      console.log(data);
      this.manageUI(data);
    });

    this.socketService.listen(SocketKey.PlayerLeave).subscribe((data: any) => {
      data.playerId = data.table.currentPlayer;
      this.manageUI(data);
      console.log(data);
      // this.showRoundPlayer(data.table.players.find(p => p.id === data.table.currentPlayer).name);
    });

    this.socketService.listen(SocketKey.BankShowCard).subscribe((data: any) => {
      this.table.bank = data.table.bank;
    });

    this.socketService.listen(SocketKey.BankDrawCard).subscribe((data: any) => {
      this.table.bank = data.table.bank;
    });

    this.socketService.listen(SocketKey.PlayerBet).subscribe((data: any) => {
      console.log(data);
      this.manageUI(data);
      const tmpPlayer = data.table.players.find(p => p.id === data.playerId);
      console.log(tmpPlayer);
      console.log(data.playerId);
      if (tmpPlayer) {
        this.showBetPlayer(tmpPlayer.name, tmpPlayer.currentBet);
      }
    });

    this.socketService.listen(SocketKey.PlayerTurn).subscribe((data: any) => {
      console.log(data);
      this.manageUI(data);
      const tmpPlayer = data.table.players.find(p => p.id === data.playerId);
      console.log(tmpPlayer);
      this.showRoundPlayer(tmpPlayer.name);
    });

    this.socketService.listen(SocketKey.StartGame).subscribe((data: any) => {
      console.log(data);
      this.manageUI(data);
    });

    this.socketService.listen(SocketKey.DrawCard).subscribe((data: any) => {
      console.log(data);
      this.manageUI(data);
    });

    this.socketService.listen(SocketKey.FinishGame).subscribe((data: any) => {
      console.log(this.socketService.socket);
      console.log('end: ', data);
      this.manageUI(data);
      this.manageEndGame(data);
    });

    this.socketService.listen(SocketKey.PlayerKick).subscribe((data: any) => {
      console.log(data.kickPlayer);
      if (this.player.id === data.kickPlayer.id) {
        this.onLeaveTable();
        alert('Vous avez été kické par l\'admin');
      } else {
        alert('Le joueur ' + data.kickPlayer.name + ' a été expulsé du lobby par l\'admin');
      }
    });
  }

  public inputBetValidator(event: any) {
    if (!this.BETUMBER_ALLOWED_CHARS_REGEXP.test(event.key)) {
      event.preventDefault();
    }
  }

  ngOnDestroy() {
    if (this.socketService.socket) {
      this.socketService.socket.removeAllListeners();
    }
  }
}
