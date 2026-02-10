import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualForm } from './manual-form';

describe('ManualForm', () => {
  let component: ManualForm;
  let fixture: ComponentFixture<ManualForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
