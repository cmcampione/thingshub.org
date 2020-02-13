import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Sensor } from './sensor';
import { ThingsManagerService } from './things-manager.service';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';

// it's no iniectable because keep things state
@Injectable()
export class SensorsService {

  private things: Thing[];
  public sensors: Sensor[] = [];

  constructor(private readonly thingsManager: ThingsManagerService,
    private readonly canceler: HttpRequestCanceler) {
    this.things = this.thingsManager.mainThing.children;
  }

  cancel() : void {
    this.canceler.cancel();
  }

  async init() {
    await this.thingsManager.thingsManager.getMoreThings(this.canceler);
    this.things.forEach(thing => {
      thing.value.sensors.forEach((sensor: { id: any; now: any; value: any; }) => {
        this.sensors.push({ name: thing.name, 
          id: sensor.id, 
          now: sensor.now, 
          millis: sensor.now, 
          value: sensor.value});      
      });
    });
  }
}
