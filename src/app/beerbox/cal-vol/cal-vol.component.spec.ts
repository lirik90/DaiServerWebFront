import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalVolComponent } from './cal-vol.component';

describe('CalVolComponent', () => {
  let component: CalVolComponent;
  let fixture: ComponentFixture<CalVolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalVolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalVolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
