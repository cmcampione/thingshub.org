import { Injectable, OnDestroy } from '@angular/core';
import { Sensor } from './sensor';
import { ThingsService } from './things.service';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';

interface SensorRaw {
  id: string;
  now: boolean;
  millis: number;
  value: number;
}

// it's no iniectable because keep things state
@Injectable()
export class SensorsService implements OnDestroy {

  private things: Thing[] = [];// It's only a ref to this.thingsService.mainThing.children
  public sensors: Sensor[] = [];

  constructor(public readonly thingsService: ThingsService) {
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
          props: {
            name: thing.name
          },
          status: {
            now: sensorRaw.now,
            millis: sensorRaw.millis,
            value: sensorRaw.value
          }
        }
        this.sensors.push(sensor);
      })
    )
  }
  done() {
    this.thingsService.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
    this.thingsService.done();
  }
  // ToDo: It's not called see https://github.com/angular/angular/issues/28857
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
          props: {
            name: thing.name
          },
          status: {
            now: sensorRaw.now,
            millis: sensorRaw.millis,
            value: sensorRaw.value
          }
        }
        sensors.push(sensor);
      })
    )
    return sensors;
  }
}
