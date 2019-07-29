import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KegsComponent } from './kegs.component';

describe('KegsComponent', () => {
  let component: KegsComponent;
  let fixture: ComponentFixture<KegsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KegsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KegsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
