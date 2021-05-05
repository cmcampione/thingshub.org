import { createReducer, on, select } from '@ngrx/store';
import { SensorValue } from '../sensors/sensor-value.model';
import { getAllSensorsValue, getAllSensorsValueSuccess, selectSensorValue } from './sensors-value.actions';

export const initialState: ReadonlyArray<SensorValue> = [];

export const sensorsValueReducer = createReducer(
    initialState,
    on(getAllSensorsValue, state => state),
    on(getAllSensorsValueSuccess, (state, { payload }) => [...payload]), // [...payload] clone the array
    on(selectSensorValue, (state, { thingId, sensorId }) =>
        state.filter((sensorValue) => thingId === sensorValue.thingId && sensorId === sensorValue.id))
);