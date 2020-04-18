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

  createTable= false;

  listTables = [];

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.setupSocketConnection();
  }

  triggerServer() {
    this.socketService.triggerServer();
    console.log(this.socketService.listServers);
    this.listTables = this.socketService.listServers;
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.triggerServer();
    }, 200);
  }

  createNewTable() {
    this.createTable = !this.createTable;
  }

  joinTable(table) {
    alert('You Join the table ' + table.id);
  }
}
