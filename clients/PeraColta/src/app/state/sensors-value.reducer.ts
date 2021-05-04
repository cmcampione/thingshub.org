import { createReducer, on } from '@ngrx/store';
import { SensorValue } from '../sensors/sensor-value.model';
import { getAllSensorsValue, getAllSensorsValueSuccess } from './sensors-value.actions';

export const initialState: ReadonlyArray<SensorValue> = [];

export const sensorsValueReducer = createReducer(
    initialState,
    on(getAllSensorsValue, state => state),
    // ToDo: Is it correct to return only "payload" without consider "state"?
    on(getAllSensorsValueSuccess, (state, { payload }) => {
        return payload;
    })
);