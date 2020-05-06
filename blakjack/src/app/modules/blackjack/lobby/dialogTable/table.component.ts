import { Component, OnInit, Input, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input() result: any;
  displayedColumns = ['username', 'point', 'status', 'credits'];
  dataSource = new MatTableDataSource<{}>();

  constructor(
    public dialogRef: MatDialogRef<TableComponent>,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
  }

  ngOnInit(): void {
    this.dataSource.data = this.data.score;
  }
}
