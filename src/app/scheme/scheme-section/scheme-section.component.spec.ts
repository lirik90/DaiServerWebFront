import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeSectionComponent } from './scheme-section.component';

describe('SchemeSectionComponent', () => {
  let component: SchemeSectionComponent;
  let fixture: ComponentFixture<SchemeSectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchemeSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
