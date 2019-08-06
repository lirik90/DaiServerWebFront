import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelConfiguratorComponent } from './label-configurator.component';

describe('LabelConfiguratorComponent', () => {
  let component: LabelConfiguratorComponent;
  let fixture: ComponentFixture<LabelConfiguratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LabelConfiguratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
