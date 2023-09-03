import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { ThingsService } from '../things.service';
import { Sensor } from './sensor.model';
import { Sensors0Service } from './sensors0.service';

@Component({
  selector: 'app-sensors0',
  templateUrl: './sensors0.component.html',
  styleUrls: ['./sensors0.component.css'],
  providers: [
    { provide: 'thingKind', useValue: 'Home appliance' },
    ThingsService,
    Sensors0Service
  ]
})
export class Sensors0Component implements OnInit, OnDestroy {

  private canceler = new HttpRequestCanceler();
  public readonly sensors: Sensor[];

  constructor(private readonly sensorsService: Sensors0Service) {
    this.sensors = sensorsService.sensors;
  }
  async ngOnInit() {
    await this.sensorsService.init(this.canceler);
  }
  ngOnDestroy() {
    this.sensorsService.done();
  }

  public async acknowledge(sensor: Sensor) {
    try {
      await this.sensorsService.setSensorValue(sensor, {
        id: sensor.id,
        value: 0
      });
    } catch (e) {
      console.log(e);
    }
  }

  public async recall() {
    try {
      await this.sensorsService.thingsService.thingsManager.getMoreThings(this.canceler);
    } catch (e) {
      console.log(e);
    }
  }
}
