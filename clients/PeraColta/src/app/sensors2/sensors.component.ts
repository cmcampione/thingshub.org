import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ThingSensor } from './thing-sensor.model';
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
}
