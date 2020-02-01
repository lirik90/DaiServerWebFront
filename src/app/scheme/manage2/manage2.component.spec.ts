import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Manage2Component } from './manage2.component';

describe('Manage2Component', () => {
  let component: Manage2Component;
  let fixture: ComponentFixture<Manage2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Manage2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Manage2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
