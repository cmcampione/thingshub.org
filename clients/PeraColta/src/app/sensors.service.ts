import { Injectable, OnDestroy } from '@angular/core';
import { Sensor } from './sensors/sensor.model';
import { ThingsService } from './things.service';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';
import { Store } from '@ngrx/store';
import { setSensorValue } from './state/sensors-value.actions';
import { SensorValue } from './sensors/sensor-value.model';

interface SensorRaw {
  id: string;
  now: boolean;
  millis: number;
  value: number;
}
@Injectable()
export class SensorsService implements OnDestroy {

  private things: Thing[] = [];// It's only a ref to this.thingsService.mainThing.children
  public sensors: Sensor[] = [];

  constructor(public readonly thingsService: ThingsService,
    private readonly store: Store) {
    this.things = this.thingsService.mainThing.children;
  }

  private searchThingById(id: string): Thing {
    return this.things.find((thing) => {
        return thing.id === id;
    })
  }
  private searchSensorById(id: string): Sensor {
    return this.sensors.find((sensor) => {
      return sensor.id === id;
    })
  }

  private readonly onUpdateThingValue = (thingId: string, value: any, asCmd: boolean): void => {
    if (asCmd)
      return;
    const thing = this.searchThingById(thingId);
    if (!thing)
      return;
    if (!value.sensors)
      return;
    value.sensors.forEach((sensorRaw: SensorRaw) => {
      const sensor = this.searchSensorById(sensorRaw.id);
      if (sensor) {
        sensor.now = sensorRaw.now;
        sensor.millis = sensorRaw.millis;
        sensor.value = sensorRaw.value;
      }
      if (this.store) {
        const newSensorValue: SensorValue = {
          thingId,
          id: sensorRaw.id,
          now: sensorRaw.now,
          millis: sensorRaw.millis,
          value: sensorRaw.value
        };
        this.store.dispatch(setSensorValue({ newSensorValue } ));
      }
    });
  }

  async init(canceler: HttpRequestCanceler) {
    this.thingsService.init();
    this.thingsService.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
    await this.thingsService.thingsManager.getMoreThings(canceler);

    this.things.forEach(thing =>
      thing.value.sensors.forEach((sensorRaw: SensorRaw) => {
        const sensor: Sensor = {
          thingId: thing.id,
          name: thing.name,
          id: sensorRaw.id,
          now: sensorRaw.now,
          millis: sensorRaw.millis,
          value: sensorRaw.value,
          sensorConfig: null,
          sensorValue: null
        }
        this.sensors.push(sensor);
      })
    )
  }

  // ToDo: Try to render as private member
  done() {
    this.thingsService.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
    this.thingsService.done();
  }

  ngOnDestroy() {
    this.done();
  }

  public async setSensorValue(sensor : Sensor, value: any): Promise<any> {
    const thing: Thing = this.searchThingById(sensor.thingId);
    if (!thing)
      return; // Sanity check
    const sensorsRaw = {sensors: [value]}
    // asCmd
    return await this.thingsService.putThingValue({ thingId: thing.id, asCmd: true, value: sensorsRaw });
  }

  // Useful for ngrx
  public async getAllSensors(): Promise<Sensor[]> {
    this.thingsService.init();
    this.thingsService.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
    await this.thingsService.thingsManager.getMoreThings(null);
    const sensors: Sensor[] = [];
    this.things.forEach(thing =>
      thing.value.sensors.forEach((sensorRaw: SensorRaw) => {
        const sensor: Sensor = {
          thingId: thing.id,
          name: thing.name,
          id: sensorRaw.id,
          now: sensorRaw.now,
          millis: sensorRaw.millis,
          value: sensorRaw.value,
          sensorConfig: null,
          sensorValue: null
        }
        sensors.push(sensor);
      })
    )
    return sensors;
  }
}
