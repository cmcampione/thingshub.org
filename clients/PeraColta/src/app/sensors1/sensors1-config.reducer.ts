import { createReducer, on } from '@ngrx/store';
import { resetAppState } from '../app.actions';
import { Sensor1Config } from './sensor1-config.model';
import { getAllSensorsConfig, getAllSensorsConfigSuccess } from './sensors1-config.actions';

export const initialState: ReadonlyArray<Sensor1Config> = [];

export const sensorsConfigReducer = createReducer(
    initialState,
    on(getAllSensorsConfig, state => state),
    on(getAllSensorsConfigSuccess, (state, { payload }) => {
        return [...payload]
    }), // [...payload] clone the array
    on(resetAppState, state => initialState)
);