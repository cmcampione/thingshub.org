import { Component, OnInit } from '@angular/core';
import {HttpRequestCanceler } from 'thingshub-js-sdk';
import { ThingsManagerService } from '../things-manager.service';
import { Sensor } from '../sensor';
import { SensorsService } from '../sensors.service';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css'],
  providers: [
    { provide: 'thingKind', useValue: 'Home appliance' },
    ThingsManagerService,
    HttpRequestCanceler,
    {
      provide: SensorsService,
      useFactory: (thingsManager: ThingsManagerService, canceler : HttpRequestCanceler) => {
        return new SensorsService(thingsManager, canceler);
      },
      deps: [ThingsManagerService, HttpRequestCanceler]
    }
  ]
})
export class SensorsComponent implements OnInit {

  sensors: Sensor[];

  constructor(private readonly sensorsService: SensorsService) {
    this.sensors = sensorsService.sensors;    
  }

  async ngOnInit() {
    await this.sensorsService.init();
  }
}
