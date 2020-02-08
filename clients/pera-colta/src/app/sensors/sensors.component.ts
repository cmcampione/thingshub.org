import { Component, OnInit } from '@angular/core';
import { Sensor } from '../sensor';
import { SensorService } from '../sensor.service';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {

  sensors: Sensor[];

  selectedSensor: Sensor;

  constructor(private sensorService: SensorService) { }

  getSensors(): void {
    this.sensorService.getSensors()
      .subscribe(sensors => this.sensors = sensors);
  }

  ngOnInit() {
    this.getSensors();
  }

  onSelect(sensor: Sensor): void {
    this.selectedSensor = sensor;
  }
}
