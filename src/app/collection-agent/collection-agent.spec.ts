import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionAgent } from './collection-agent';

describe('CollectionAgent', () => {
  let component: CollectionAgent;
  let fixture: ComponentFixture<CollectionAgent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionAgent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionAgent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
