import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartFilterComponent } from './chart-filter.component';

describe('ChartFilterComponent', () => {
  let component: ChartFilterComponent;
  let fixture: ComponentFixture<ChartFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
