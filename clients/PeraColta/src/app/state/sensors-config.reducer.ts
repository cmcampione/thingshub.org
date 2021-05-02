import { createReducer, on, Action } from '@ngrx/store';
import { SensorConfig } from '../sensor-config.model';

export const initialState: ReadonlyArray<SensorConfig> = [];

export const sensorsConfigReducer = createReducer(
    initialState
);