import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceKegComponent } from './replace-keg.component';

describe('ReplaceKegComponent', () => {
  let component: ReplaceKegComponent;
  let fixture: ComponentFixture<ReplaceKegComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplaceKegComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplaceKegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
