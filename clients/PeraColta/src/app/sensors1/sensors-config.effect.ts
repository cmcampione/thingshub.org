import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, from } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { SensorsConfigService } from './sensors-config.service';
import { GET_ALL_SENSORS_CONFIG, GET_ALL_SENSORS_CONFIG_SUCCESS } from './sensors-config.actions';
import { RESET_APP_STATE } from '../app.actions';

@Injectable()
export class SensorsConfigEffects {

    resetSensorsConfig$ = createEffect(() => this.actions$.pipe(
        ofType(RESET_APP_STATE),
        tap(() => this.sensorsConfigService.thingsService.reset())
        ),
        { dispatch: false }
    )

    loadSensorsConfig$ = createEffect(() => this.actions$.pipe(
        ofType(GET_ALL_SENSORS_CONFIG),
        mergeMap(() => from(this.sensorsConfigService.getAll())
            .pipe(
                map(sensorsConfig => ({ type: GET_ALL_SENSORS_CONFIG_SUCCESS, payload: sensorsConfig })),
                catchError(() => EMPTY) // ToDo: Manage error
            )
        ))
    )

    constructor(
        private actions$: Actions,
        private sensorsConfigService: SensorsConfigService
        ) {
    }
}
