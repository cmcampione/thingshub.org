import { createAction, props } from '@ngrx/store';
import { RESET_APP_STATE } from '../app.actions';
import { SensorValue } from '../sensors/sensor-value.model';

export const GET_ALL_SENSORS_VALUE          = '[Sensors Value] Load Sensors Value';
export const GET_ALL_SENSORS_VALUE_SUCCESS  = '[Sensors Value] Sensors Value Loaded Success';
export const SET_SENSOR_VALUE               = '[Sensors Value] Select sensor value';

export const getAllSensorsValue = createAction(
    GET_ALL_SENSORS_VALUE
);

export const getAllSensorsValueSuccess = createAction(
    GET_ALL_SENSORS_VALUE_SUCCESS,
    props<{ payload: SensorValue[] }>()
);

export const setSensorValue = createAction(
    SET_SENSOR_VALUE,
    props<{ newSensorValue: SensorValue }>()
);
