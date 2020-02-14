import { Injectable, OnDestroy } from '@angular/core';
import { Sensor } from './sensor';
import { ThingsService } from './things.service';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';

// it's no iniectable because keep things state
@Injectable()
export class SensorsService implements OnDestroy {

  private things: Thing[];
  public sensors: Sensor[] = [];

  constructor(public readonly thingsService: ThingsService) {
    this.things = this.thingsService.mainThing.children;
  }

  async init(canceler: HttpRequestCanceler) {
    this.thingsService.init();
    await this.thingsService.thingsManager.getMoreThings(canceler);
    this.things.forEach(thing => {
      thing.value.sensors.forEach((sensor: { id: number; now: any; millis: number; value: any; }) => {
        this.sensors.push({
          thingId: thing.id,
          name: thing.name,
          id: sensor.id,
          now: sensor.now,
          millis: sensor.millis,
          value: sensor.value});
      });
    });
  }
  done() {
    this.thingsService.done();
  }

  // ToDo: It's not called see https://github.com/angular/angular/issues/28857
  ngOnDestroy() {
    this.thingsService.done();
  }
}
