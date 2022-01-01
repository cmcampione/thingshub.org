import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, from } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';

import { GET_ALL_THINGS_SENSORS, GET_ALL_THINGS_SENSORS_SUCCESS } from './things-sensors.actions';
import { RESET_APP_STATE } from '../app.actions';
import { ThingsSensorsService } from './things-sensors.service';

@Injectable()
export class ThingsSensorsEffects {

    resetThingsSensors$ = createEffect(() => this.actions$.pipe(
            ofType(RESET_APP_STATE),
            tap(() => this.thingsSensorsService.thingsService.reset())
        ),
        { dispatch: false }
    )

    loadThingsSensorsValue$ = createEffect(() => this.actions$.pipe(
        ofType(GET_ALL_THINGS_SENSORS),
        mergeMap(() =>
            from(this.thingsSensorsService.getAll()).pipe(
                map(thingsSensors => ({ type: GET_ALL_THINGS_SENSORS_SUCCESS, payload: thingsSensors })),
                catchError(() => EMPTY) // ToDo: Manage error
            )
        ))
    )

    constructor(
        private actions$: Actions,
        private thingsSensorsService: ThingsSensorsService
        ) {
    }
}
