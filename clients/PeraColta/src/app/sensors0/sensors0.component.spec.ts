import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sensors0Component } from './sensors0.component';

describe('Sensors0Component', () => {
  let component: Sensors0Component;
  let fixture: ComponentFixture<Sensors0Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sensors0Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sensors0Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
