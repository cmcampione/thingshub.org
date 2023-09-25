import { format } from 'date-fns';
import { Component, Input, OnInit } from '@angular/core';
import { SensorKind, SensorKindType } from '../sensor-config.model';
import { Sensor } from '../sensor.model';
import { ThingsSensorsService } from '../things-sensors.service';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent implements OnInit {

  @Input() thingId: string;
  @Input() sensor: Sensor;

  // https://stackoverflow.com/questions/44045311/cannot-approach-typescript-enum-within-html
  SensorKind = SensorKind;
  SensorKindType = SensorKindType;

  constructor(private thingsSensorsService: ThingsSensorsService) {

  }

  
  ngOnInit() {
  }

  get iconColor() : string {
    if (this.sensor.sensorValue.value >= this.sensor.sensorConfig.redValueMin &&
      this.sensor.sensorValue.value <= this.sensor.sensorConfig.redValueMax)
      return 'red';
    if (this.sensor.sensorValue.now === true)
      return 'yellow';
    if (this.sensor.sensorValue.value >= this.sensor.sensorConfig.greenValueMin &&
      this.sensor.sensorValue.value <= this.sensor.sensorConfig.greenValueMax)
      return 'green';
    return '';
  }

  get sensorDateTime() : string {
    const date = new Date(this.sensor.sensorValue.millis * 1000); // Moltiplica per 1000 per convertire da secondi a millisecondi
    // ToDo: Globalizate format
    return format(date, 'dd/MM/yyyy HH:mm:ss');
  }

  async changingValue($event: any) {
    // ToDo: Check value range
    const value = {
      id: this.sensor.id,
      value: $event.detail.value
    }
    try {
      await this.thingsSensorsService.setSensorValue(this.thingId, value)
    }
    catch(error) {
      // ToDo: During 401 error we don't have to notify nothing, but for different error we should notify some error message
      // Could be used CustomError check
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
      console.log(error);
    }
  }

}
