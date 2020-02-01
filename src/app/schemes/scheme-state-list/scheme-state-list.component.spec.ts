import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeStateListComponent } from './scheme-state-list.component';

describe('SchemeStateListComponent', () => {
  let component: SchemeStateListComponent;
  let fixture: ComponentFixture<SchemeStateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemeStateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemeStateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
