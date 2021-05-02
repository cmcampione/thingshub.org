import { createReducer, on, Action } from '@ngrx/store';
import { SensorValue } from '../sensor-value.model';
import { getAllSensorsValue, getAllSensorsValueSuccess } from './sensors-value.actions';

export const initialState: ReadonlyArray<SensorValue> = [];

export const sensorsValueReducer = createReducer(
    initialState,
    on(getAllSensorsValue, state => state),
    on(getAllSensorsValueSuccess, (state, { payload }) => {
        return payload;
    })
);