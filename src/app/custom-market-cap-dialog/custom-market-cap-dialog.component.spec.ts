import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMarketCapDialogComponent } from './custom-market-cap-dialog.component';

describe('CustomMarketCapDialogComponent', () => {
  let component: CustomMarketCapDialogComponent;
  let fixture: ComponentFixture<CustomMarketCapDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomMarketCapDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomMarketCapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
