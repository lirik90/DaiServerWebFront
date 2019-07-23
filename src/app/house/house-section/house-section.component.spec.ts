import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseSectionComponent } from './house-section.component';

describe('HouseSectionComponent', () => {
  let component: HouseSectionComponent;
  let fixture: ComponentFixture<HouseSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
