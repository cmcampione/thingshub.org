import { createAction, props } from '@ngrx/store';
import { Sensor1Config } from './sensor1-config.model';

export const GET_ALL_SENSORS1_CONFIG          = '[Sensors Config 1] Load Sensors Config';
export const GET_ALL_SENSORS1_CONFIG_SUCCESS  = '[Sensors Config 1] Sensors Config Loaded Success';

export const getAllSensorsConfig = createAction(
    GET_ALL_SENSORS1_CONFIG
);

export const getAllSensorsConfigSuccess = createAction(
    GET_ALL_SENSORS1_CONFIG_SUCCESS,
    props<{ payload: Sensor1Config[] }>()
);