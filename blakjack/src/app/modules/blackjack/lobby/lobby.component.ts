import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { SocketKey } from '../../../shared/models/enums/SocketKey';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TableComponent } from './dialogTable/table.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit, OnDestroy {

  @ViewChild('timerBar') timerBar: ElementRef;

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
  isMyTurn = false;
  message = 'Welcome !';
  activity;
  playerInactivity: Subject<any> = new Subject();
  timer;
  timerCountdown: Subject<any> = new Subject();

  isBetAmountCorrect = () => {
    return this.betAmount > 0 && this.betAmount <= this.player.credits;
  }

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
    console.log(data);
    this.player = this.table.players.splice(playerIndex, 1)[0];
    this.isMyTurn = this.player.id === data.playerId;
    //timerBar
    if (this.isMyTurn) {
      clearTimeout(this.timer);
      this.setTimeout(10);
      this.playerInactivity = new Subject();
      this.timerCountdown = new Subject();
      this.playerInactivity.subscribe(() => {
        console.log('user has been inactive for 15s');
        clearInterval(this.timer);
        this.endRound();
        this.timerBar.nativeElement.style.width = '0%';
      });
      this.timerCountdown.subscribe();
    } else {
      this.playerInactivity.complete();
      this.refreshUserState();
    }
    this.enableDrawBtn = data.isShownDrawButton && this.isMyTurn;
    this.enableEndTurn = this.isMyTurn && this.table.status === 'S';
    this.enableDoubleBtn = data.isShownDoubleButton && this.isMyTurn;
    this.showBet = this.table.status === 'B' && this.player.currentBet === 0;
    this.canBetButton = this.showBet;

    if (this.table.id.includes(this.socketService.getConnectionId()) || this.table.adminId === this.socketService.getConnectionId()) {
      this.isAdmin = true;
    }
  }

  setTimeout(count: number) {
    let time = -500;
    if (this.timerBar) {
      this.timerBar.nativeElement.style.width = '0%';
    }

    this.timer = setInterval(() => {
      if (!this.isMyTurn) { this.refreshUserState(); }
      this.timerCountdown.next();
      time++;
      if (this.timerBar) {
        this.timerBar.nativeElement.style.width = ((time / 100 ) * 10).toString() + '%';
      }
    }, 10);
    this.activity = setTimeout(() => this.playerInactivity.next(undefined), count * 1500);
  }

  @HostListener('window:mousemove') @HostListener('click') refreshUserState() {
    clearTimeout(this.activity);
    clearTimeout(this.timer);

    if (this.isMyTurn) {
      this.setTimeout(10);
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
      this.socketService.socket.emit(SocketKey.Action, {
        actionKeys: SocketKey.PlayerBet,
        roomId: this.tableId,
        playerId: this.player.id,
        betMoney: this.betAmount
      });
    }
  }

  doubleBet() {
    this.enableDrawBtn = false;
    this.socketService.socket.emit(SocketKey.Action, {
      actionKeys: SocketKey.PlayerDouble,
      roomId: this.tableId,
      playerId: this.player.id
    });
  }

  endRound() {
    this.socketService.socket.emit(SocketKey.Action, {
      actionKeys: SocketKey.PlayerEnd,
      roomId: this.tableId,
      playerId: this.player.id
    });
  }

  onLeaveTable() {
    this.socketService.socket.emit(SocketKey.LeaveTable, { roomId: this.table.id });
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  showRoundPlayer(username: string) {
    this.message = 'A ' + username + ' de jouer !';
  }

  showBetPlayer(username: string, betMoney: string) {
    this.message = username + ' a misé ' + betMoney + '€';
    // this.snackBar.open(username + ' a misé ' + betMoney + '€', null, {
    //   duration: 1500,
    //   verticalPosition: 'top'
    // });
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
      data:
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

  getDifficulty(): string {
    switch (this.table.difficulty) {
      case 1:
        return '1 paquet';
        break;
      case 2:
        return '2 paquets';
        break;
      case 4:
        return '4 paquets';
        break;
      case 8:
        return '8 paquets';
        break;
      default:
        return '1 paquet';
        break;
    }
  }

  private setupSocketConnection() {

    this.socketService.listen(SocketKey.JoinTable).subscribe((data: any) => {
      this.manageUI(data);
      this.init = true;
    });

    this.socketService.listen(SocketKey.PlayerJoin).subscribe((data: any) => {
      this.manageUI(data);
    });

    this.socketService.listen(SocketKey.PlayerLeave).subscribe((data: any) => {
      data.playerId = data.table.currentPlayer;
      this.manageUI(data);
    });

    this.socketService.listen(SocketKey.BankShowCard).subscribe((data: any) => {
      this.table.bank = data.table.bank;
      this.isMyTurn = false;
      this.refreshUserState();
    });

    this.socketService.listen(SocketKey.BankDrawCard).subscribe((data: any) => {
      this.table.bank = data.table.bank;
    });

    this.socketService.listen(SocketKey.PlayerBet).subscribe((data: any) => {
      this.manageUI(data);
      const tmpPlayer = data.table.players.find(p => p.id === data.playerId);
      if (tmpPlayer) {
        this.showBetPlayer(tmpPlayer.name, tmpPlayer.currentBet);
      }
    });

    this.socketService.listen(SocketKey.PlayerTurn).subscribe((data: any) => {
      this.manageUI(data);
      const tmpPlayer = data.table.players.find(p => p.id === data.playerId);
      this.showRoundPlayer(tmpPlayer.name);
    });

    this.socketService.listen(SocketKey.StartGame).subscribe((data: any) => {
      this.manageUI(data);
    });

    this.socketService.listen(SocketKey.DrawCard).subscribe((data: any) => {
      this.manageUI(data);
    });

    this.socketService.listen(SocketKey.FinishGame).subscribe((data: any) => {
      this.manageUI(data);
      this.manageEndGame(data);
    });

    this.socketService.listen(SocketKey.PlayerKick).subscribe((data: any) => {
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
