import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, from } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { SensorsValueService } from './sensors-value.service';
import { GET_ALL_SENSORS_VALUE, GET_ALL_SENSORS_VALUE_SUCCESS } from './state/sensors-value.actions';

@Injectable()
export class SensorValueEffects {

    loadSensorsValue$ = createEffect(() => this.actions$.pipe(
        ofType(GET_ALL_SENSORS_VALUE),
        mergeMap(() => from(this.sensorsValueService.getAll())
            .pipe(
                map(sensorsValue => ({ type: GET_ALL_SENSORS_VALUE_SUCCESS, payload: sensorsValue })),
                catchError(() => EMPTY)
            )
        ))
    );

constructor(
    private actions$: Actions,
    private sensorsValueService: SensorsValueService
    ) {
    }
}