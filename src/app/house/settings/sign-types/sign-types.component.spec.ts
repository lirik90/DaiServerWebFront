import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignTypesComponent } from './sign-types.component';

describe('SignTypesComponent', () => {
  let component: SignTypesComponent;
  let fixture: ComponentFixture<SignTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
