import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
  Action
} from '@ngrx/store';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { environment } from '../../environments/environment';
import { Sensor } from '../sensors/sensor.model'
import { Injectable } from '@angular/core';
import { SensorsService } from '../sensors.service';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { EMPTY, from } from 'rxjs';

// Actions

export const GET_ALL = '[SENSOR] Get All';
export const GET_ALL_SUCCESS = '[SENSOR] GET All Success';

export class GetAllAction implements Action {
  readonly type = GET_ALL;
}

export class GetAllSuccessAction implements Action {
  readonly type = GET_ALL_SUCCESS;
  constructor(public payload: Sensor[]) {
  }
}

export type ALL_REDUCER_ACTIONS = GetAllAction | GetAllSuccessAction;

// Effects

@Injectable()
export class SensorEffects {

  loadAllSensors$ = createEffect(() => {
    return this.actions$.pipe(ofType(GET_ALL), mergeMap(() => {
      return from(this.sensorsService.getAllSensors()).pipe(map(sensors => {
        return new GetAllSuccessAction(sensors);
      }), catchError(() => {
        return EMPTY;
      }));
    }));
  });

  constructor(private actions$: Actions, private sensorsService: SensorsService)
  {
  }
}

// States

export interface SensorState {
	sensors: Sensor[];
}

export interface AppState {
  sensorState: SensorState;
}

// Reducer

export const initialState: SensorState = { sensors: [] };

export function reducer(state = initialState, action: ALL_REDUCER_ACTIONS): SensorState {
  switch(action.type) {
    case GET_ALL: {
      return state;
    }
    case GET_ALL_SUCCESS: {
      return {sensors: action.payload};
    }
    default: {
      return state;
    }
  }
}

export const getSensorState = createFeatureSelector<SensorState>('sensorState');

export const getSensors = createSelector(
  getSensorState,
  (state: SensorState) => state.sensors
);

// Reducers

export const reducers: ActionReducerMap<AppState> = {
  sensorState: reducer
};

export function logger(r: ActionReducer<AppState, Action>): ActionReducer<AppState> {
  return (state: AppState, action: any): AppState => {
    console.log('state', state);
    console.log('action', action);
    return r(state, action);
  };
}

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [logger] : [];
