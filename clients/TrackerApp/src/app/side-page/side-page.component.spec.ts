import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePageComponent } from './side-page.component';

describe('SidePageComponent', () => {
  let component: SidePageComponent;
  let fixture: ComponentFixture<SidePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
