import { createAction, props } from '@ngrx/store';
import { SensorValue } from '../sensors/sensor-value.model';

export const GET_ALL_SENSORS_VALUE          = '[Sensors Value] Load Sensors Value';
export const GET_ALL_SENSORS_VALUE_SUCCESS  = '[Sensors Value] Sensors Value Loaded Success';
export const SELECT_SENSOR_VALUE            = '[Sensors Value] Select sensor value';

export const getAllSensorsValue = createAction(
    GET_ALL_SENSORS_VALUE
);

export const getAllSensorsValueSuccess = createAction(
    GET_ALL_SENSORS_VALUE_SUCCESS,
    props<{ payload: SensorValue[] }>()
);

export const selectSensorValue = createAction(
    SELECT_SENSOR_VALUE,
    props<{thingId: string, sensorId: string }> ()
);