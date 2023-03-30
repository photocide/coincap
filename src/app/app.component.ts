import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { concatMap, map, tap } from 'rxjs';
import { CoinDataSnackbarComponent } from './coin-data-snackbar/coin-data-snackbar.component';
import { CustomMarketCapDialogComponent } from './custom-market-cap-dialog/custom-market-cap-dialog.component';
import packageJSON from 'package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'cmc_rank',
    'logo',
    'name',
    'price',
    'percent_change_1h',
    'percent_change_24h',
    'percent_change_7d',
    'market_cap',
    '1TMCP',
    'BTCMCP',
    'ETHMCP',
    'BNBMCP',
    'custom_market_cap_price'
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  customMarketCap: number = 1000000000000;

  constructor(private http: HttpClient, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  openCustomMarketCapDialog() {
    const dialogRef = this.dialog.open(CustomMarketCapDialogComponent, {
      data: {
        customMarketCap: this.customMarketCap
      },
      width: '320px',
      height: '120px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.customMarketCap = result || 1000000000000;
    });
  }

  openTokesDialog(price: number) {
    const dialogRef = this.dialog.open(CustomMarketCapDialogComponent, {
      data: {
        tokens: 0
      },
      width: '320px',
      height: '120px'
    });

    dialogRef.afterClosed().subscribe(tokens => {
      if (typeof tokens == 'undefined') return;
      this.snackBar.open(`Total tokens value: $${(tokens * price).toFixed(2)}`, 'Close', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
    });
  }

  getCoinData(data: any) {
    this.snackBar.openFromComponent(
      CoinDataSnackbarComponent,
      {
        verticalPosition: 'top',
        horizontalPosition: 'center',
        data
      });
  }

  ngOnInit() {
    const headers = { 'X-CMC_PRO_API_KEY': packageJSON.apiKey };
    const ids: string[] = [];
    let coins: any[] = [];

    this.http.get<{ data: any }>(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers,
      params: {
        limit: 400
      }
    })
      .pipe(
        map(({ data }) => data),
        map((data) => {
          coins = [...data];
          return data;
        }),
        tap(data => [...data].map(({ id }) => ids.push('' + id))),
        concatMap(() => this.http.get<{ data: any }>(
          'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info', {
          headers,
          params: {
            id: ids.join(','),
            aux: 'logo,description'
          }
        })),
        map(({ data }) => data),
        map((data) => {
          coins = coins.map((c, i) => {
            c = { ...c, ...c.quote.USD, ...data[c.id] }
            return c;
          });
          localStorage.setItem('coins', JSON.stringify(coins))
          return coins;
        }),
        map(data => this.dataSource.data = [...data])
      )
      .subscribe({
        error: () => {
          this.dataSource.data = JSON.parse(localStorage.getItem('coins') || '[]');
          this.snackBar.open('Something went wrong, using cached data', 'Close');
        },
      });
  }

  get btcMarketCap() {
    return this.dataSource.data.find(c => c.symbol == 'BTC').market_cap;
  }

  get ethMarketCap() {
    return this.dataSource.data.find(c => c.symbol == 'ETH').market_cap;
  }

  get bnbMarketCap() {
    return this.dataSource.data.find(c => c.symbol == 'BNB').market_cap;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
