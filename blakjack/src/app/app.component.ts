import { Component, OnInit } from '@angular/core';
import { SocketService } from './shared/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'blakjack';

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.setupSocketConnection();
  }

}
