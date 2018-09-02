import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTypesComponent } from './status-types.component';

describe('StatusTypesComponent', () => {
  let component: StatusTypesComponent;
  let fixture: ComponentFixture<StatusTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
