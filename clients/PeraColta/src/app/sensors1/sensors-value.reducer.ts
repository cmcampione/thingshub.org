import { createReducer, on, select } from '@ngrx/store';
import { resetAppState } from '../app.actions';
import { SensorValue } from './sensor-value.model';
import { getAllSensorsValue, getAllSensorsValueSuccess, setSensorValue } from './sensors-value.actions';

export const initialState: ReadonlyArray<SensorValue> = [];

export const sensorsValueReducer = createReducer(
    initialState,
    on(getAllSensorsValue, state => state),
    on(getAllSensorsValueSuccess, (state, { payload }) => [...payload]), // [...payload] clone the array
    on(setSensorValue, (state, { newSensorValue }) => {
        const localState = state.map(sensorValue => {
            if (newSensorValue.thingId === sensorValue.thingId && newSensorValue.id === sensorValue.id)
                return newSensorValue;
            return sensorValue;
        })
        return localState;
    }),
    on(resetAppState, state => initialState)
)
