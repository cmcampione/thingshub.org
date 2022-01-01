import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sensors1Component } from './sensors1.component';

describe('SensorsComponent', () => {
  let component: Sensors1Component;
  let fixture: ComponentFixture<Sensors1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sensors1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sensors1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
