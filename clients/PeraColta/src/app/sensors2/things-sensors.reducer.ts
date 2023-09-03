import { createReducer, on, select } from '@ngrx/store';

import { resetAppState } from '../app.actions';
import { Sensor } from './sensor.model';
import { ThingSensor } from './thing-sensor.model';
import { getAllThingsSensors, getAllThingsSensorsSuccess, setThingSensorValue } from './things-sensors.actions';

export const initialState: ReadonlyArray<ThingSensor> = [];

export const thingsSensorsReducer = createReducer(
    initialState,
    on(getAllThingsSensors, state => state),
    on(getAllThingsSensorsSuccess, (state, { payload }) => payload),
    on(setThingSensorValue, (state, { thingId, sensorId, sensorValue }) => {
        return state.map(thingSensor => {
            const newSensors = thingSensor.sensors.map(sensor => {
                // ToDo: use lodash for better deep copy
                const newSensor: Sensor = { ...sensor, sensorValue: { ...sensor.sensorValue }, sensorConfig: { ...sensor.sensorConfig} };
                if (thingId === thingSensor.thingId && sensorId === newSensor.id)
                    newSensor.sensorValue = { ...sensorValue }
                return newSensor;
            });
            return {
                ...thingSensor,
                sensors: newSensors
            };
        });
    }),
    on(resetAppState, state => initialState)
)
