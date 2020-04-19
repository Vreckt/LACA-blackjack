import { Component, OnInit, AfterContentInit } from '@angular/core';
import { SocketBlackJackService } from './shared/services/socket-blackjack.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'blakjack';

  ngOnInit(){}

}
