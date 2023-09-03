import { Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { SensorValue } from './sensor-value.model';
import { selectThingsSensors, selectThingsSensorsCount } from './things-sensors.selectors';
import { ThingSensor } from './thing-sensor.model';
import { getAllThingsSensors, setThingSensorValue } from './things-sensors.actions';
import { getAllSensorsConfig } from './config/sensors-config.actions';

// ToDo: Move up
interface SensorValueRaw {
  id: string;
  now: boolean;
  millis: number;
  value: number;
}

@Component({
  selector: 'app-things-sensors',
  templateUrl: './things-sensors.component.html',
  styleUrls: ['./things-sensors.component.scss'],
})
export class ThingsSensorsComponent implements OnInit, OnDestroy {

  private canceler = new HttpRequestCanceler();

  public  thingsSensors$ = this.store.pipe(select(selectThingsSensors));

  private thingsSensorsCount = 0;
  public thingsSensorsCount$ = this.store.pipe(select(selectThingsSensorsCount));
  private readonly subscriptionThingsSensorsCount: Subscription = null;

  private readonly onUpdateThingValue = (thingId: string, value: any, asCmd: boolean): void => {
    if (asCmd)
      return;
    // ToDo: Check for correct thing kind. Waiting for change server notification to add thinkKind parameter
    if (!value.sensors)
      return;
    value.sensors.forEach((sensorRaw: SensorValueRaw) => {
      const sensorValue: SensorValue = {
        now: sensorRaw.now,
        millis: sensorRaw.millis,
        value: sensorRaw.value
      };
      const sensorId = sensorRaw.id;
      this.store.dispatch(setThingSensorValue({ thingId, sensorId, sensorValue } ));
    });
  }

  constructor(private readonly store: Store<{}>,
    public readonly realTimeConnector: RealTimeConnectorService) {
      // Info: Here I'm already loggedin so is possible to register an event handler
      this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
      this.subscriptionThingsSensorsCount = this.thingsSensorsCount$.subscribe(v => this.thingsSensorsCount = v);
  }

  ngOnInit() {
    // Reducers are pure functions in that they produce the same output for a given input.
    // They are without side effects and handle each state transition synchronously.
    // Each reducer function takes the latest Action dispatched, the current state,
    // and determines whether to return a newly modified state or the original state.
    // https://ngrx.io/guide/store/reducers

    // This check is useful during refresh of component and keep the state to avoid pagination problem
    if (this.thingsSensorsCount === 0) {
      // Below methods are commented because we need to know the number of sensors before display this component
      this.store.dispatch(getAllSensorsConfig()); // It is syncronous as abose comment
      this.store.dispatch(getAllThingsSensors());  // It is syncronous as abose comment
    }
  }
  ngOnDestroy() {
    // ToDo: Arrive after the real-time connector is unsubscribed
    this.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
    this.canceler.cancel();
    this.subscriptionThingsSensorsCount.unsubscribe();
  }

  // https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
  trackByFn(index, item: ThingSensor) {
    return item.thingId;
  }
}
