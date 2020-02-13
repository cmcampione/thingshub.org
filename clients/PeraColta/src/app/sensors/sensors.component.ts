import { Component, OnInit } from '@angular/core';
import { ThingsManagerService } from '../things-manager.service';
import { Sensor } from '../sensor';
import { SensorsService } from '../sensors.service';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css'],
  providers: [
    { provide: 'thingKind', useValue: 'Home Appliance' },
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
export class SensorsComponent implements OnInit {

  sensors: Sensor[];

  selectedSensor: Sensor;

  constructor(private readonly sensorsService: SensorsService) { }

  getSensors(): void {
  }

  ngOnInit() {
    this.getSensors();
  }

  onSelect(sensor: Sensor): void {
    this.selectedSensor = sensor;
  }
}
