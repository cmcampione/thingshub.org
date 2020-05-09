import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { Sensor } from '../sensor'

export interface SensorState {
	sensors: Sensor[];
}

export interface AppState {
  sensorState: SensorState;
}

export const initialState: SensorState = { sensors: [] };

export function reducer(state = initialState): SensorState {
  return state;
}

export const getSensorState = createFeatureSelector<SensorState>('sensorState');

export const getSensors = createSelector(
  getSensorState,
    (state: SensorState) => state.sensors
);

export const reducers: ActionReducerMap<AppState> = {
  sensorState: reducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
