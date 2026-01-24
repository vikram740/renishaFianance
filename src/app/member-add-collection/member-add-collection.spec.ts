import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberAddCollection } from './member-add-collection';

describe('MemberAddCollection', () => {
  let component: MemberAddCollection;
  let fixture: ComponentFixture<MemberAddCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberAddCollection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberAddCollection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
