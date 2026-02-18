import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntrestPage } from './intrest-page';

describe('IntrestPage', () => {
  let component: IntrestPage;
  let fixture: ComponentFixture<IntrestPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntrestPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntrestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
