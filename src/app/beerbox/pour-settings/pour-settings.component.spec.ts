import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PourSettingsComponent } from './pour-settings.component';

describe('PourSettingsComponent', () => {
  let component: PourSettingsComponent;
  let fixture: ComponentFixture<PourSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PourSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PourSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
