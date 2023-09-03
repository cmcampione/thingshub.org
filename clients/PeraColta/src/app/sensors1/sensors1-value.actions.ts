import { createAction, props } from '@ngrx/store';
import { RESET_APP_STATE } from '../app.actions';
import { Sensor1Value } from './sensor1-value.model';

export const GET_ALL_SENSORS1_VALUE          = '[Sensors Value] Load Sensors Value';
export const GET_ALL_SENSORS1_VALUE_SUCCESS  = '[Sensors Value] Sensors Value Loaded Success';
export const SET_SENSOR_VALUE               = '[Sensors Value] Select Sensor Value';

export const getAllSensorsValue = createAction(
    GET_ALL_SENSORS1_VALUE
);

export const getAllSensorsValueSuccess = createAction(
    GET_ALL_SENSORS1_VALUE_SUCCESS,
    props<{ payload: Sensor1Value[] }>()
);

export const setSensorValue = createAction(
    SET_SENSOR_VALUE,
    props<{ newSensorValue: Sensor1Value }>()
);
