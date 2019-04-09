import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBeerInfoComponent } from './update-beer-info.component';

describe('UpdateBeerInfoComponent', () => {
  let component: UpdateBeerInfoComponent;
  let fixture: ComponentFixture<UpdateBeerInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateBeerInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateBeerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
