import { createAction, props } from '@ngrx/store';
import { SensorValue } from '../sensor-value.model';

export const GET_ALL_SENSORS_VALUE          = '[Sensors Value] Load Sensors Value';
export const GET_ALL_SENSORS_VALUE_SUCCESS  = '[Sensors Value] Sensors Value Loaded Success';

export const getAllSensorsValue = createAction(
    GET_ALL_SENSORS_VALUE
);

export const getAllSensorsValueSuccess = createAction(
    GET_ALL_SENSORS_VALUE_SUCCESS,
    props<{ payload: SensorValue[] }>()
);