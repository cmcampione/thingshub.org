import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sensors2Component } from './sensors2.component';

describe('Sensors2Component', () => {
  let component: Sensors2Component;
  let fixture: ComponentFixture<Sensors2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sensors2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sensors2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
