import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { select, Store } from '@ngrx/store';
import { selectSensors } from '../sensors/sensors.selectors';
import { getAllSensorsValue, setSensorValue } from '../sensors/sensors-value.actions';
import { getAllSensorsConfig } from '../sensors/sensors-config.actions';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { SensorValue } from './sensor-value.model';

interface SensorRaw {
  id: string;
  now: boolean;
  millis: number;
  value: number;
}

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

  private readonly onUpdateThingValue = (thingId: string, value: any, asCmd: boolean): void => {
    if (asCmd)
      return;
    // ToDo: Check for correct thing kind
    if (!value.sensors)
      return;
    value.sensors.forEach((sensorRaw: SensorRaw) => {
      const newSensorValue: SensorValue = {
        thingId,
        id: sensorRaw.id,
        now: sensorRaw.now,
        millis: sensorRaw.millis,
        value: sensorRaw.value
      };
      this.store.dispatch(setSensorValue({ newSensorValue } ));
    });
  }

  constructor(private readonly store: Store,
    public readonly realTimeConnector: RealTimeConnectorService) {
      this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
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
    this.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
    this.canceler.cancel();
  }
}
