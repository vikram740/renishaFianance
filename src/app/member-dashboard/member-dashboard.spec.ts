import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDashboard } from './member-dashboard';

describe('MemberDashboard', () => {
  let component: MemberDashboard;
  let fixture: ComponentFixture<MemberDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
