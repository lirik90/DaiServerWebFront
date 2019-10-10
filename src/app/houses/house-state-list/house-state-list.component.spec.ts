import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseStateListComponent } from './house-state-list.component';

describe('HouseStateListComponent', () => {
  let component: HouseStateListComponent;
  let fixture: ComponentFixture<HouseStateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseStateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseStateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
