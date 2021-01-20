import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAndDevicesComponent } from './users-and-devices.component';

describe('UsersAndDevicesComponent', () => {
  let component: UsersAndDevicesComponent;
  let fixture: ComponentFixture<UsersAndDevicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersAndDevicesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersAndDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
