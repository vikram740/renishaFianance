import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealForm } from './deal-form';

describe('DealForm', () => {
  let component: DealForm;
  let fixture: ComponentFixture<DealForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
