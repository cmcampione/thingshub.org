import { createReducer, on, Action } from '@ngrx/store';
import { SensorConfig } from '../sensors/sensor-config.model';
import { getAllSensorsConfig, getAllSensorsConfigSuccess } from './sensors-config.actions';

export const initialState: ReadonlyArray<SensorConfig> = [];

export const sensorsConfigReducer = createReducer(
    initialState,
    on(getAllSensorsConfig, state => state),
    // ToDo: Is it correct to return only "payload" without consider "state"?
    on(getAllSensorsConfigSuccess, (state, { payload }) => {
        return payload;
    })
);