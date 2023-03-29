import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-market-cap-dialog',
  templateUrl: './custom-market-cap-dialog.component.html',
  styleUrls: ['./custom-market-cap-dialog.component.scss']
})
export class CustomMarketCapDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }
}
