import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { select, Store } from '@ngrx/store';
import { selectSensors } from '../state/sensors.selectors';
import { getAllSensorsValue } from '../state/sensors-value.actions';
import { getAllSensorsConfig } from '../state/sensors-config.actions';

// ToDo: We have to use canceler
// ToDo: We have to implement pagination support
@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit, OnDestroy {

  private canceler = new HttpRequestCanceler();
  public  sensors$ = this.store.pipe(select(selectSensors));

  constructor(private readonly store: Store) {
  }

  ngOnInit() {
    // Reducers are pure functions in that they produce the same output for a given input.
    // They are without side effects and handle each state transition synchronously.
    // Each reducer function takes the latest Action dispatched, the current state,
    // and determines whether to return a newly modified state or the original state.
    // https://ngrx.io/guide/store/reducers
    this.store.dispatch(getAllSensorsConfig()); // It is syncronous as abose comment
    this.store.dispatch(getAllSensorsValue());
  }
  ngOnDestroy() {
    this.canceler.cancel();
  }
}
