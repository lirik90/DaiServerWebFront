import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceLabelsComponent } from './replace-labels.component';

describe('ReplaceLabelsComponent', () => {
  let component: ReplaceLabelsComponent;
  let fixture: ComponentFixture<ReplaceLabelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceLabelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceLabelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
