import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevItemValueComponent } from './dev-item-value.component';

describe('DevItemValueComponent', () => {
  let component: DevItemValueComponent;
  let fixture: ComponentFixture<DevItemValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevItemValueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevItemValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
