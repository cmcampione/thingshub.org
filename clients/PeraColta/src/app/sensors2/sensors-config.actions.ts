import { createAction, props } from '@ngrx/store';
import { SensorConfig } from './sensor-config.model';

export const GET_ALL_SENSORS_CONFIG          = '[Sensors Config] Load Sensors Config';
export const GET_ALL_SENSORS_CONFIG_SUCCESS  = '[Sensors Config] Sensors Config Loaded Success';

export const getAllSensorsConfig = createAction(
    GET_ALL_SENSORS_CONFIG
);

export const getAllSensorsConfigSuccess = createAction(
    GET_ALL_SENSORS_CONFIG_SUCCESS,
    props<{ payload: SensorConfig[] }>()
);