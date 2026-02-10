import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualCollection } from './manual-collection';

describe('ManualCollection', () => {
  let component: ManualCollection;
  let fixture: ComponentFixture<ManualCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualCollection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
