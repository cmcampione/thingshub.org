import { createAction, props } from '@ngrx/store';
import { SensorValue } from '../sensors/sensor-value.model';

export const GET_ALL_SENSORS_VALUE          = '[Sensors Value] Load Sensors Value';
export const GET_ALL_SENSORS_VALUE_SUCCESS  = '[Sensors Value] Sensors Value Loaded Success';
export const ON_UPDATE_SENSORS_VALUE        = '[Sensors Value] On update sensor Value';

export const getAllSensorsValue = createAction(
    GET_ALL_SENSORS_VALUE
);

export const getAllSensorsValueSuccess = createAction(
    GET_ALL_SENSORS_VALUE_SUCCESS,
    props<{ payload: SensorValue[] }>()
);

export const onUpdateSensorsValue = createAction(
    ON_UPDATE_SENSORS_VALUE
);