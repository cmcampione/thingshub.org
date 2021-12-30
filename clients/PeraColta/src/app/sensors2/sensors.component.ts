import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { select, Store } from '@ngrx/store';
import { selectSensors, selectSensorsCount } from './sensors.selectors';
import { setSensorValue } from './sensors-value.actions';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { SensorValue } from './sensor-value.model';
import { Sensor } from './sensor.model';
import { Subscription } from 'rxjs';

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

  private sensorsCount = 0;
  public sensorsCount$ = this.store.pipe(select(selectSensorsCount));
  private readonly subscriptionSensorsCount: Subscription = null;

  private readonly onUpdateThingValue = (thingId: string, value: any, asCmd: boolean): void => {
    if (asCmd)
      return;
    // ToDo: Check for correct thing kind. Waiting for change server notification to add thinkKind parameter
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

  constructor(private readonly store: Store<{}>,
    public readonly realTimeConnector: RealTimeConnectorService) {
      // Info: Here I'm already loggedin so is possible to register an event handler
      this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
      this.subscriptionSensorsCount = this.sensorsCount$.subscribe(v => this.sensorsCount = v);
  }
  // Info: Called every time component is shown
  ngOnInit() {
    // Reducers are pure functions in that they produce the same output for a given input.
    // They are without side effects and handle each state transition synchronously.
    // Each reducer function takes the latest Action dispatched, the current state,
    // and determines whether to return a newly modified state or the original state.
    // https://ngrx.io/guide/store/reducers

    // This check is useful during refresh of component and keep the state to avoid pagination problem
    if (this.sensorsCount === 0) {
      // Below methods are commented because we need to know the number of sensors before display this component
      // this.store.dispatch(getAllSensorsConfig()); // It is syncronous as abose comment
      // this.store.dispatch(getAllSensorsValue());  // It is syncronous as abose comment
    }
  }
  // Info: Called every time component is hidden
  ngOnDestroy() {
    // ToDo: Arrive after the real-time connector is unsubscribed
    this.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
    this.canceler.cancel();
    this.subscriptionSensorsCount.unsubscribe();
  }

  // https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
  trackByFn(index, item: Sensor) {
    // ToDo: Maybe need thingId?
    return item.sensorValue.id; // or item.id
  }
}
