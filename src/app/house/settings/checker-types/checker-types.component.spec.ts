import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckerTypesComponent } from './checker-types.component';

describe('CheckerTypesComponent', () => {
  let component: CheckerTypesComponent;
  let fixture: ComponentFixture<CheckerTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckerTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckerTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
