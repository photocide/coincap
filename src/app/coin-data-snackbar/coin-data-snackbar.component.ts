import { Component, inject, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-coin-data-snackbar',
  templateUrl: './coin-data-snackbar.component.html',
  styleUrls: ['./coin-data-snackbar.component.scss']
})
export class CoinDataSnackbarComponent {
  snackBarRef = inject(MatSnackBarRef);
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}
