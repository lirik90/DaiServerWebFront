import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParamItemComponent } from './param-item.component';

describe('ParamItemComponent', () => {
  let component: ParamItemComponent;
  let fixture: ComponentFixture<ParamItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParamItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParamItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
