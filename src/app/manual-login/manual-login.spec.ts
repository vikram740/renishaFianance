import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualLogin } from './manual-login';

describe('ManualLogin', () => {
  let component: ManualLogin;
  let fixture: ComponentFixture<ManualLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
