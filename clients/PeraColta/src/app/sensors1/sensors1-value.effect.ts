import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, from } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { SensorsValueService } from './sensors1-value.service';
import { GET_ALL_SENSORS1_VALUE, GET_ALL_SENSORS1_VALUE_SUCCESS } from './sensors1-value.actions';
import { RESET_APP_STATE } from '../app.actions';

@Injectable()
export class Sensors1ValueEffects {

    resetSensorsConfig$ = createEffect(() => this.actions$.pipe(
            ofType(RESET_APP_STATE),
            tap(() => this.sensorsValueService.thingsService.reset())
        ),
        { dispatch: false }
    )

    loadSensorsValue$ = createEffect(() => this.actions$.pipe(
        ofType(GET_ALL_SENSORS1_VALUE),
        mergeMap(() =>
            from(this.sensorsValueService.getAll()).pipe(
                map(sensorsValue => ({ type: GET_ALL_SENSORS1_VALUE_SUCCESS, payload: sensorsValue })),
                catchError(() => EMPTY) // ToDo: Manage error
            )
        ))
    )

    constructor(
        private actions$: Actions,
        private sensorsValueService: SensorsValueService
        ) {
    }
}
