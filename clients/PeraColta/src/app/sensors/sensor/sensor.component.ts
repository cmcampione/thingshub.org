import { Component, Input, OnInit } from '@angular/core';
import { SensorKind, SensorKindType } from '../sensor-config.model';
import { Sensor } from '../sensor.model';
import { SensorsValueService } from '../sensors-value.service';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent implements OnInit {

  @Input() sensor: Sensor;

  // https://stackoverflow.com/questions/44045311/cannot-approach-typescript-enum-within-html
  SensorKind = SensorKind;
  SensorKindType = SensorKindType;

  constructor(private readonly sensorsValueService: SensorsValueService) {

  }

  ngOnInit() {}

  get iconColor() : string {
    if (this.sensor.sensorConfig.kind === SensorKind.Digital && this.sensor.sensorValue.value == 1)
      return 'red';
    if (this.sensor.sensorValue.now === true)
      return 'yellow';
    if (this.sensor.sensorConfig.kind === SensorKind.Digital && this.sensor.sensorValue.value == 0)
      return 'green';
    return "";
  }

  changingValue($event: any) {
    let value = {
      id: this.sensor.id,
      value: $event.detail.value
    }
    this.sensorsValueService.setSensorValue(this.sensor.sensorValue, value )
  }

}
