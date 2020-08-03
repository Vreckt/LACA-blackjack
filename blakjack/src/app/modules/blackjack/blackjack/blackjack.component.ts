import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SocketBlackJackService } from 'src/app/shared/services/socket-blackjack.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketKey } from '../../../shared/models/enums/SocketKey';
import { TableType } from 'src/app/shared/models/enums/tableType';

@Component({
  selector: 'app-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss']
})
export class BlackjackComponent implements OnInit {

  createTable = false;
  username: string;
  icon = 1;
  formNewTable: FormGroup;
  listTables = [];
  formConfirmPassword: FormGroup;
  createPasswordTable = false;
  passwordCheckFail = false;
  selectedTable = {};

  constructor(
    private socketService: SocketBlackJackService,
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username');
    this.icon = +localStorage.getItem('iconColor');
    if (!this.socketService.socket) {
      this.socketService.connectToSocket();
    }
    if (this.username) {
      this.setupSocketConnection();
    } else {
      this.router.navigate(['../connection'], { relativeTo: this.route });
    }
    this.formNewTable = new FormGroup({
      roomName: new FormControl('', Validators.required),
      password: new FormControl(''),
      difficulty: new FormControl('', Validators.required),
    });
    console.log(this.socketService.listServers);
    setTimeout(() => {
      this.listTables = this.socketService.listServers;
    }, 100);

    this.formConfirmPassword = new FormGroup({
      confirmPassword: new FormControl(''),
    });
  }

  showTableForm() {
    this.createTable = (this.createTable === false) ? true : false;
    this.listTables.forEach(function (value) {
      value.joined = false;
    });
    this.createPasswordTable = false;
    this.passwordCheckFail = false;
  }

  onCreateRoom() {
    this.socketService.createNewLobby({
      roomName: this.formNewTable.value.roomName,
      configs: {
        tableType: TableType.Blackjack,
        difficulty: this.formNewTable.value.difficulty,
        isPrivate: this.formNewTable.value.password ? true : false,
        password: this.formNewTable.value.password
      }
    });
  }

  getServerName(table) {
    return table.name;
  }

  joinTable(table) {
    // faire côté serveur pour check le password
    const confirmPassword = this.formConfirmPassword.value.confirmPassword;
    console.log(table.password);
    console.log(this.listTables);
    if (table.password === confirmPassword)
    {
      this.passwordCheckFail = false;
      this.router.navigate([table.id], { relativeTo: this.route });
    }
    else
    {
      this.formConfirmPassword.reset();
      this.passwordCheckFail = true;
    }
  }

  showPasswordForm(table) {
    this.formConfirmPassword.reset();
    table.joined = (table.joined === false) ? true : false;
    this.listTables.forEach(function (value) {
      if (table.id !== value.id) {
        value.joined = false;
      }
    });
    this.createPasswordTable = table.joined;
    this.createTable = false;
    this.selectedTable = table;
    this.passwordCheckFail = false;
  }

  resetPasswordTable() {
    this.listTables.forEach(function (value) {
      value.joined = false;
    });
    this.createPasswordTable = false;
    this.passwordCheckFail = false;
  }

  disconnect() {
    localStorage.clear();
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private setupSocketConnection() {
    this.socketService.socket.on(SocketKey.Connected, data => {
      this.socketService.keepConnectionId(data.id);
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });

    this.socketService.socket.on(SocketKey.NewLobby, data => {
      this.router.navigate([data.roomId], { relativeTo: this.route });
    });

    this.socketService.socket.on(SocketKey.UpdateLobby, data => {
      this.socketService.listServers = data.servers;
      this.listTables = data.servers;
    });
  }
}
