import { createReducer, on, select } from '@ngrx/store';

import { resetAppState } from '../app.actions';
import { ThingSensor } from './thing-sensor.model';
import { getAllThingsSensors, getAllThingsSensorsSuccess, setThingSensorValue } from './things-sensors.actions';

export const initialState: ReadonlyArray<ThingSensor> = [];

export const thingsSensorsReducer = createReducer(
    initialState,
    on(getAllThingsSensors, state => state),
    on(getAllThingsSensorsSuccess, (state, { payload }) => [...payload]), // [...payload] clones the array
    on(setThingSensorValue, (state, { thingId, sensorId, sensorValue }) => {
        const thingSensor = state.find(thingSensor => thingSensor.thingId === thingId);
        if (!thingSensor)
            return state;
        const sensor = thingSensor.sensors.find(sensor => sensor.id === sensorId)
        if (!sensor)
            return state;
        sensor.sensorValue = sensorValue;
        return state;
    }),
    on(resetAppState, state => initialState)
)
