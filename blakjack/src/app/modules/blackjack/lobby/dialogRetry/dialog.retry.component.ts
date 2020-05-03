import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-lobby-dialog-retry',
  templateUrl: './dialog.retry.component.html',
})

export class DialogRetryComponent {

  constructor(public dialogRef: MatDialogRef<DialogRetryComponent>) {}

  retry() {
    this.dialogRef.close();
  }

}
