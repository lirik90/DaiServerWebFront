import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTypesComponent } from './group-types.component';

describe('GroupTypesComponent', () => {
  let component: GroupTypesComponent;
  let fixture: ComponentFixture<GroupTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
