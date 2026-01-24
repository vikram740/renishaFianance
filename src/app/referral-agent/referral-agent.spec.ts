import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralAgent } from './referral-agent';

describe('ReferralAgent', () => {
  let component: ReferralAgent;
  let fixture: ComponentFixture<ReferralAgent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralAgent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferralAgent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
