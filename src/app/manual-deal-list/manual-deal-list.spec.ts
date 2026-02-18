import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualDealList } from './manual-deal-list';

describe('ManualDealList', () => {
  let component: ManualDealList;
  let fixture: ComponentFixture<ManualDealList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualDealList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualDealList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
