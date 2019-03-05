import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckHeadStandComponent } from './check-head-stand.component';

describe('CheckHeadStandComponent', () => {
  let component: CheckHeadStandComponent;
  let fixture: ComponentFixture<CheckHeadStandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckHeadStandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckHeadStandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
