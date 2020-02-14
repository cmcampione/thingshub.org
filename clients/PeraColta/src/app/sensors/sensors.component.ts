import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
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
    {
      provide: SensorsService,
      useFactory: (thingsManager: ThingsManagerService) => {
        return new SensorsService(thingsManager);
      },
      deps: [ThingsManagerService]
    }
  ]
})
export class SensorsComponent implements OnInit, OnDestroy {

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

  public async recall() {
    try {
      await this.sensorsService.thingsManager.thingsManager.getMoreThings(this.canceler);
    } catch (e) {
      console.log(e);
    }
  }
}
