import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Sensor } from './sensor';
import { ThingsManagerService, THING_KIND } from './things-manager.service';

@Injectable({
  providedIn: 'root'
})
export class SensorsService {

  constructor() { }

  getSensors(): Observable<Sensor[]> {
    return of(null);
  }
}
