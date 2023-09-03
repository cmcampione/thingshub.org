import { createAction, props } from '@ngrx/store';
import { RESET_APP_STATE } from '../app.actions';
import { SensorValue } from './sensor-value.model';
import { ThingSensor } from './thing-sensor.model';

export const GET_ALL_THINGS_SENSORS          = '[Things Sensors Value] Load Things Sensors';
export const GET_ALL_THINGS_SENSORS_SUCCESS  = '[Things Sensors Value] Things Sensors Loaded Success';
export const SET_THING_SENSOR_VALUE          = '[Thing Sensors Value] Select Thing Sensor';

export const getAllThingsSensors = createAction(
    GET_ALL_THINGS_SENSORS
);

export const getAllThingsSensorsSuccess = createAction(
    GET_ALL_THINGS_SENSORS_SUCCESS,
    props<{ payload: ThingSensor[] }>()
);

export const setThingSensorValue = createAction(
    SET_THING_SENSOR_VALUE,
    props<{ thingId: string, sensorId: string, sensorValue: SensorValue }>()
);
