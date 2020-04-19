import { Component, OnInit, AfterViewInit, AfterContentInit } from '@angular/core';
import { SocketService } from './shared/services/socket.service';
import { Table } from './shared/models/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterContentInit {
  title = 'blakjack';

  createTable = false;

  username: string;

  listTables = [];

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    console.log(this.username);
    if (this.username) { this.initConnectionServer(); }
  }

  ngAfterContentInit() { }

  private initConnectionServer() {
    this.socketService.setupSocketConnection();
    this.triggerServer();
  }

  private triggerServer() {
    setTimeout(() => {
      this.socketService.triggerServer();
      console.log(this.socketService.listServers);
      this.listTables = this.socketService.listServers;
    }, 200);
  }

  createNewTable() {
    this.createTable = !this.createTable;
  }

  createUsername(username: string) {
    console.log(username);
    this.initConnectionServer();
    localStorage.setItem('username', username);
    this.username = username;
  }

  joinTable(table) {
    alert('You Join the table ' + table.id);
  }
}
