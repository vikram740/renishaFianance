import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualDashboard } from './manual-dashboard';

describe('ManualDashboard', () => {
  let component: ManualDashboard;
  let fixture: ComponentFixture<ManualDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
