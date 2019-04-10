import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeControllerAddressComponent } from './change-controller-address.component';

describe('ChangeControllerAddressComponent', () => {
  let component: ChangeControllerAddressComponent;
  let fixture: ComponentFixture<ChangeControllerAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeControllerAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeControllerAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
