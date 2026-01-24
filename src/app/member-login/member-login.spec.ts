import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberLogin } from './member-login';

describe('MemberLogin', () => {
  let component: MemberLogin;
  let fixture: ComponentFixture<MemberLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
