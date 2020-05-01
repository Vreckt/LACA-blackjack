import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SocketBlackJackService } from '../shared/services/socket-blackjack.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketKey } from '../shared/models/enums/SocketKey';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit {
  username: string;

  formNewTable: FormGroup;
  constructor(
    private socketService: SocketBlackJackService,
    private route: ActivatedRoute,
    private router: Router
    ) { }

  ngOnInit(): void {
    if (localStorage.getItem('username')) {
      this.router.navigate(['../blackjack'], { relativeTo: this.route });
    }
  }

  createUsername(username: string): void {
    localStorage.setItem('username', username);
    // this.username = username;
    setTimeout(() => {
      this.initConnectionServer();
    }, 100);
  }

  private initConnectionServer() {
    this.socketService.connectToSocket();
    this.setupSocket();
  }
  private setupSocket() {
    this.socketService.socket.on(SocketKey.Connected, data => {
      this.socketService.keepConnectionId(data.id);
      this.socketService.listServers = data.servers;
      console.log(this.socketService.listServers);
      // si on provient d'un lien d'invitation
      if (sessionStorage.getItem('inviteTo')) {
        const route = sessionStorage.getItem('inviteTo');
        sessionStorage.removeItem('inviteTo');
        this.router.navigate(['./' + route]);
      } else {
        this.router.navigate(['./blackjack']);
      }
    });
  }

}
