import { createReducer, on, select } from '@ngrx/store';

import { resetAppState } from '../app.actions';
import { ThingSensor } from './thing-sensor.model';
import { getAllThingsSensorsValue, getAllThingsSensorsValueSuccess, setThingSensorValue } from './things-sensors.actions';

export const initialState: ReadonlyArray<ThingSensor> = [];

export const thingsSensorsReducer = createReducer(
    initialState,
    on(getAllThingsSensorsValue, state => state),
    on(getAllThingsSensorsValueSuccess, (state, { payload }) => [...payload]), // [...payload] clones the array
    on(setThingSensorValue, (state, { thingId, sensorId, sensorValue }) => {
        let thingSensor = state.find(thingSensor => thingSensor.id === thingId);
        if (!thingSensor)
            return state;       
        let sensor = thingSensor.sensors.find(sensor => sensor.id === sensorId)
        if (!sensor)
            return state;       
        sensor.sensorValue = sensorValue;
        return state;
    }),
    on(resetAppState, state => initialState)
)
