import { createReducer, on } from '@ngrx/store';
import { SensorConfig } from '../sensors/sensor-config.model';
import { getAllSensorsConfig, getAllSensorsConfigSuccess } from './sensors-config.actions';

export const initialState: ReadonlyArray<SensorConfig> = [];

export const sensorsConfigReducer = createReducer(
    initialState,
    on(getAllSensorsConfig, state => state),
    on(getAllSensorsConfigSuccess, (state, { payload }) => [...payload]) // [...payload] clone the array
);