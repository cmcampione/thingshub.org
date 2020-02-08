import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Sensor } from './sensor';

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  constructor() { }

  getSensors(): Observable<Sensor[]> {
    return of(null);
  }
}
