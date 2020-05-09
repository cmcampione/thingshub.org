import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { ThingsService } from '../things.service';
import { Sensor } from '../sensor';
import { SensorsService } from '../sensors.service';

@Component({
  selector: 'app-sensors1',
  templateUrl: './sensors1.component.html',
  styleUrls: ['./sensors1.component.css'],
  providers: [
    { provide: 'thingKind', useValue: 'Home appliance' },
    ThingsService,
    {
      provide: SensorsService,
      deps: [ThingsService]
    }
  ]
})
export class Sensors1Component implements OnInit, OnDestroy {

  private canceler = new HttpRequestCanceler();
  public readonly sensors: Sensor[];

  constructor(private readonly sensorsService: SensorsService) {
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
