import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { concat, map, tap } from 'rxjs';
import { CoinDataSnackbarComponent } from './coin-data-snackbar/coin-data-snackbar.component';
import { CustomMarketCapDialogComponent } from './custom-market-cap-dialog/custom-market-cap-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    '#',
    'img',
    'name',
    'price',
    '1H',
    '24H',
    '7D',
    'last7DTrend',
    'Market Cap',
    '1TMCP',
    'BTCMCP',
    'ETHMCP',
    'BNBMCP',
    'customMarketCapPrice'
  ];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  customMarketCap: number = 1000000000000;

  constructor(private http: HttpClient, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  private fetchData(page: number) {
    return this.http.get(`https://www.coingecko.com/?page=${page}`, {
      responseType: 'text'
    })
      .pipe(
        map(text => {
          const html = document.createElement('html');
          html.innerHTML = text;
          return html;
        }),
        map(html => html.querySelector('[data-target="currencies.contentBox"]')),
        map(html => [...html!.querySelectorAll('tr')]),
        map(arr => arr.map((e, i) => {
          return {
            index: this.dataSource.data.length + i + 1,
            name: e.querySelector('td:nth-child(3) a span')?.textContent?.replace(/\n/g, '')!,
            symbol: e.querySelector('td:nth-child(3) a span + span')?.textContent?.replace(/\n/g, '')!,
            image: e.querySelector('td:nth-child(3) div img')?.getAttribute('src')?.replace(/\n/g, '')!,
            priceString: e.querySelector('td:nth-child(4)')?.textContent?.replace(/\n/g, '')!,
            priceChange1H: +e.querySelector('td:nth-child(5)')?.textContent?.replace(/[\n|\%]/g, '')!,
            priceChange24H: +e.querySelector('td:nth-child(6)')?.textContent?.replace(/[\n|\%]/g, '')!,
            priceChange7D: +e.querySelector('td:nth-child(7)')?.textContent?.replace(/[\n|\%]/g, '')!,
            marketCapString: e.querySelector('td:nth-child(9)')?.textContent?.replace(/\n/g, '')!,
            price: +e.querySelector('td:nth-child(4)')?.textContent?.replace(/[\n|,|$]/g, '')!,
            marketCap: +e.querySelector('td:nth-child(9)')?.textContent?.replace(/[\n|,|$]/g, '')!,
            last7DTrend: e.querySelector('td:last-child img')?.getAttribute('src')?.replace(/\n/g, '')!,
          }
        })),
        map(arr => arr.map(e => {
          const btcMarketCap = (this.dataSource.data.length > 1 ? this.dataSource.data : arr).find(e => e.symbol == 'BTC')?.marketCap!;
          const ethMarketCap = (this.dataSource.data.length > 1 ? this.dataSource.data : arr).find(e => e.symbol == 'ETH')?.marketCap!;
          const bnbMarketCap = (this.dataSource.data.length > 1 ? this.dataSource.data : arr).find(e => e.symbol == 'BNB')?.marketCap!;
          return {
            ...e,
            btcMarketCap,
            ethMarketCap,
            bnbMarketCap,
            priceStringAtOneTrillionDollarMarketCap: `$${(1000000000000 / e.marketCap * e.price).toFixed(2)}`,
            priceStringAtOneTrillionDollarMarketCapMultiplier: +(1000000000000 / e.marketCap).toFixed(2),
            priceStringAtBitcoinDollarMarketCap: `$${(btcMarketCap / e.marketCap * e.price).toFixed(2)}`,
            priceStringAtBitcoinDollarMarketCapMultiplier: +(btcMarketCap / e.marketCap).toFixed(2),
            priceStringAtEthereumDollarMarketCap: `$${(ethMarketCap / e.marketCap * e.price).toFixed(2)}`,
            priceStringAtEthereumDollarMarketCapMultiplier: +(ethMarketCap / e.marketCap).toFixed(2),
            priceStringAtBNBDollarMarketCap: `$${(bnbMarketCap / e.marketCap * e.price).toFixed(2)}`,
            priceStringAtBNBDollarMarketCapMultiplier: +(bnbMarketCap / e.marketCap).toFixed(2)
          }
        })),
        tap(arr => this.dataSource.data = [
          ...this.dataSource.data,
          ...arr
        ]),
      )
  }

  private loadBatch(page: number) {
    const req = [];
    for (let i = 0; i < page; i++) {
      req.push(this.fetchData(i + 1));
    }
    concat(...req).subscribe();
  }

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

  getCoinData(_id: string) {
    let page: any = null;
    let id = _id.toLowerCase().split(' ').join('-');

    //Edge cases
    if (id == 'juno' || id == 'request') id += '-network';

    this.http.get(`https://www.coingecko.com/en/coins/${id}`, {
      responseType: 'text'
    })
      .pipe(
        map(text => {
          const html = document.createElement('html');
          html.innerHTML = text;
          page = html;
          return html;
        }),
        map(html => html.querySelectorAll('[itemtype="https://schema.org/Table"] table tr')),
        map(html => [...html]),
        map(arr => ({
          marketCapRank: arr[4].querySelector('td')!.textContent?.replace(/\n/g, ''),
          marketCapDominance: arr[6].querySelector('.tw-text-right')!.textContent?.replace(/\n/g, ''),
          allTimeHigh: arr[8].querySelector('[data-target="price.price"]')!.textContent?.replace(/\n/g, ''),
          allTimeHighWhen: arr[8].querySelector('small')!.textContent?.replace(/\n/g, ''),
          allTimeHighPercentage: +arr[8].querySelector('[data-target="price.price"] + span')!.textContent?.replace(/[\n|\%|,]/g, '')!,
          allTimeLow: arr[9].querySelector('[data-target="price.price"]')!.textContent?.replace(/\n/g, ''),
          allTimeLowWhen: arr[9].querySelector('small')!.textContent?.replace(/\n/g, ''),
          allTimeLowPercentage: +arr[9].querySelector('[data-target="price.price"] + span')!.textContent?.replace(/[\n|\%|,]/g, '')!,
        })),
        map(data => ({
          ...data,
          circulatingSupply: +page.querySelector('[data-controller="coins-information"] div')?.textContent
            .replace(/[\n|\s|,]/g, '')
            .match(/(?=CirculatingSupply).+(?=TotalSupply)/g)
            .toString()
            .replace('CirculatingSupply', ''),
          description: page.querySelector('[data-target="read-more.description"]')?.innerHTML
        })),
        map(data => {
          this.snackBar.openFromComponent(
            CoinDataSnackbarComponent,
            {
              verticalPosition: 'top',
              horizontalPosition: 'center',
              data: { ...data, name: _id }
            })
        })
      )
      .subscribe()
  }

  ngOnInit() {
    this.loadBatch(4);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
