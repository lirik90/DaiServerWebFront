import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelElementTextComponent } from './label-element-text.component';

describe('LabelElementTextComponent', () => {
  let component: LabelElementTextComponent;
  let fixture: ComponentFixture<LabelElementTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelElementTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelElementTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
