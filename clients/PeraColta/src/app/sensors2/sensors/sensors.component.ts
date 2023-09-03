import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Sensor } from 'src/app/sensors2/sensor.model';
import { ThingSensor } from '../thing-sensor.model';
@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit, OnDestroy {

  @Input() thingSensor: ThingSensor;

  constructor() {
  }
  // Info: Called every time component is shown
  ngOnInit() {
  }
  // Info: Called every time component is hidden
  ngOnDestroy() {
  }

  // https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5
  trackByFn(index, item: Sensor) {
    return item.id;
  }
}
