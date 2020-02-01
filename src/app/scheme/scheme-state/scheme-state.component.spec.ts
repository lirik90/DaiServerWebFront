import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeStateComponent } from './scheme-state.component';

describe('SchemeStateComponent', () => {
  let component: SchemeStateComponent;
  let fixture: ComponentFixture<SchemeStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemeStateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemeStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
