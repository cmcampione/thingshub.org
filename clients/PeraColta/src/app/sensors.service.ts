import { Injectable, OnDestroy } from '@angular/core';
import { Sensor } from './sensor';
import { ThingsManagerService } from './things-manager.service';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';

// it's no iniectable because keep things state
@Injectable()
export class SensorsService implements OnDestroy {

  private things: Thing[];
  public sensors: Sensor[] = [];

  constructor(public readonly thingsManager: ThingsManagerService) {
    this.things = this.thingsManager.mainThing.children;
  }

  async init(canceler: HttpRequestCanceler) {
    this.thingsManager.init();
    await this.thingsManager.thingsManager.getMoreThings(canceler);
    this.things.forEach(thing => {
      thing.value.sensors.forEach((sensor: { id: any; now: any; value: any; }) => {
        this.sensors.push({
          thingId: thing.id,
          name: thing.name,
          id: sensor.id,
          now: sensor.now,
          millis: sensor.now,
          value: sensor.value});
      });
    });
  }
  done() {
    this.thingsManager.done();
  }

  ngOnDestroy() {
    //this.thingsManager.done();
  }
}
