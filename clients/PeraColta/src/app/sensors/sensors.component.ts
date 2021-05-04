import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { select, Store } from '@ngrx/store';
import { selectSensors } from '../state/sensors.selectors';
import { getAllSensorsValue } from '../state/sensors-value.actions';
import { getAllSensorsConfig } from '../state/sensors-config.actions';

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
    this.store.dispatch(getAllSensorsConfig()); // ToDo: is it sure that SensorsConfig arrival before SensorsValue?
    this.store.dispatch(getAllSensorsValue());
  }
  ngOnDestroy() {
    this.canceler.cancel();
  }
}
