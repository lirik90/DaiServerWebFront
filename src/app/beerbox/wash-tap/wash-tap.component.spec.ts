import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WashTapComponent } from './wash-tap.component';

describe('WashTapComponent', () => {
  let component: WashTapComponent;
  let fixture: ComponentFixture<WashTapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WashTapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WashTapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
