import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimarQrLog } from './primar-qr-log';

describe('PrimarQrLog', () => {
  let component: PrimarQrLog;
  let fixture: ComponentFixture<PrimarQrLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimarQrLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrimarQrLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
