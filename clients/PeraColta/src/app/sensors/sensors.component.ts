import { Component, OnInit } from '@angular/core';
import { Sensor } from '../sensor';
import { SensorsService } from '../sensors.service';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css'],
  providers: [
    { provide: 'thingKind', useValue: 'first thing' }
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
