import { createAction, props } from '@ngrx/store';
import { SensorConfig } from '../sensor-config.model';

export const GET_ALL_SENSORS_CONFIG         = '[Sensors Config 2] Load Sensors Config';
export const GET_ALL_SENSORS_CONFIG_SUCCESS = '[Sensors Config 2] Sensors Config Loaded Success';

export const getAllSensorsConfig = createAction(
    GET_ALL_SENSORS_CONFIG
);

export const getAllSensorsConfigSuccess = createAction(
    GET_ALL_SENSORS_CONFIG_SUCCESS,
    props<{ payload: SensorConfig[] }>()
);