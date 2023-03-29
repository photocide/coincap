import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinDataSnackbarComponent } from './coin-data-snackbar.component';

describe('CoinDataSnackbarComponent', () => {
  let component: CoinDataSnackbarComponent;
  let fixture: ComponentFixture<CoinDataSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoinDataSnackbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoinDataSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
