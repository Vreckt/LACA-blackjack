import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {

  init = false;
  tableId;
  table;
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
      console.log('pass')
      this.socketBlackJackService.connectToSocket();
      this.socket = this.socketBlackJackService.socket;
      this.aftersocketInit();
    }
  }

  aftersocketInit() {
    if (this.socket) {
      console.log('pass2')
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



  private setupSocketConnection() {

    this.socket.on('join table', data => {
      console.log(data);
      if (data.status === 'success') {
        this.table = data.table;
        this.init = true;
      }
    });
    this.socket.on('trigger', () => {
      console.log('Trigger');
    });

    this.socket.on('player join', (data) => {
      console.log('someone join !');
    });
  }

}
