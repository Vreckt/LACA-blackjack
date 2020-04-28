import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  openRules() {
    const dialogRules = this.dialog.open(DialogRulesComponent);
  }

  ngOnInit(): void { }

}

@Component({
  selector: 'app-dialog-rules',
  templateUrl: './dialog.rules.html',
  styleUrls: ['./rules.component.scss']
})
export class DialogRulesComponent { }
