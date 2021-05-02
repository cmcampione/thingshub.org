import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './app.state';
import { SensorValue } from '../sensor-value.model';
import { SensorConfig, SensorKind, SensorKindType } from '../sensor-config.model';
import { Sensor } from '../sensor.model';

export const selectSensorsValue = createFeatureSelector<
    AppState,
    ReadonlyArray<SensorValue>>('sensorsValue');

export const selectSensorsConfig = createFeatureSelector<
    AppState,
    ReadonlyArray<SensorConfig>>('sensorsConfig');

export const selectSensors = createSelector(
    selectSensorsValue,
    selectSensorsConfig,
    (sensorsValue : Array<SensorValue>, sensorsConfig : Array<SensorConfig>) : Sensor[] => {
        return sensorsValue.map((sensorValueRaw) => {
            let sensorConfigRaw: SensorConfig = {
                thingId: null,
                name: null,
                id: sensorValueRaw.id,
                kind: SensorKind.Undefined,
                kindType: SensorKindType.Undefined,
                min: 0,
                max: 0
            }
            const sc = sensorsConfig.find((sensorConfig) => sensorValueRaw.id === sensorConfig.id);
            if (sc)
                sensorConfigRaw = sc;
            return {
                thingId: sensorValueRaw.thingId,
                id: sensorValueRaw.id, // equal to sensorConfigRaw.id

                // ToDo: To remove
                name: sensorConfigRaw.name,
                now: sensorValueRaw.now,
                millis: sensorValueRaw.millis,
                value: sensorValueRaw.value,

                //
                sensorConfig: sensorConfigRaw,
                sensorValue: sensorValueRaw
        }});
    });