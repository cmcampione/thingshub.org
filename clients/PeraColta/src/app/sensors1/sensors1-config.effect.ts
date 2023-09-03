import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, from } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { Sensors1ConfigService } from './sensors1-config.service';
import { GET_ALL_SENSORS1_CONFIG, GET_ALL_SENSORS1_CONFIG_SUCCESS } from './sensors1-config.actions';
import { RESET_APP_STATE } from '../app.actions';

@Injectable()
export class Sensors1ConfigEffects {

    resetSensorsConfig$ = createEffect(() => this.actions$.pipe(
        ofType(RESET_APP_STATE),
        tap(() => this.sensorsConfigService.thingsService.reset())
        ),
        { dispatch: false }
    )

    loadSensorsConfig$ = createEffect(() => this.actions$.pipe(
        ofType(GET_ALL_SENSORS1_CONFIG),
        mergeMap(() => from(this.sensorsConfigService.getAll())
            .pipe(
                map(sensorsConfig => ({ type: GET_ALL_SENSORS1_CONFIG_SUCCESS, payload: sensorsConfig })),
                catchError(() => EMPTY) // ToDo: Manage error
            )
        ))
    )

    constructor(
        private actions$: Actions,
        private sensorsConfigService: Sensors1ConfigService
        ) {
    }
}
