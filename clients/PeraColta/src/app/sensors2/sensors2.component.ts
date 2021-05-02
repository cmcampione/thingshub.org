import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpRequestCanceler } from 'thingshub-js-sdk';
import { Sensor } from '../sensor.model';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectSensors } from '../state/sensors.selectors';
import { getAllSensorsValue } from '../state/sensors-value.actions';

@Component({
  selector: 'app-sensors2',
  templateUrl: './sensors2.component.html',
  styleUrls: ['./sensors2.component.css']
})
export class Sensors2Component implements OnInit, OnDestroy {

  private canceler = new HttpRequestCanceler();
  public  sensors$ = this.store.pipe(select(selectSensors));

  constructor(private readonly store: Store) {
  }

  ngOnInit() {
    this.store.dispatch(getAllSensorsValue());
  }
  ngOnDestroy() {
    this.canceler.cancel();
  }

  public async acknowledge(sensor: Sensor) {
  /*
    try
    {
        await this.sensorsService.setSensorValue(sensor, {
          id: sensor.id,
          value: 0
        });
    } catch (e) {
        console.log(e);
    }
  */
  }

  public async recall() {
    /* try {
      await this.sensorsService.thingsService.thingsManager.getMoreThings(this.canceler);
    } catch (e) {
      console.log(e);
    } */
  }
}
