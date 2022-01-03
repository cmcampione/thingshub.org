import { createReducer, on } from '@ngrx/store';
import { resetAppState } from '../../app.actions';
import { SensorConfig } from '../sensor-config.model';
import { getAllSensorsConfig, getAllSensorsConfigSuccess } from './sensors-config.actions';

export const initialState: ReadonlyArray<SensorConfig> = [];

export const sensorsConfigReducer = createReducer(
    initialState,
    on(getAllSensorsConfig, state => state),
    on(getAllSensorsConfigSuccess, (state, { payload }) => payload),
    on(resetAppState, state => initialState)
);