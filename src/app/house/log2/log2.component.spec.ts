import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Log2Component } from './log2.component';

describe('LogComponent', () => {
  let component: Log2Component;
  let fixture: ComponentFixture<Log2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Log2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Log2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
