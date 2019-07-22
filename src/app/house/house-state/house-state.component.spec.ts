import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseStateComponent } from './house-state.component';

describe('HouseStateComponent', () => {
  let component: HouseStateComponent;
  let fixture: ComponentFixture<HouseStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
