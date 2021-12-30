import { createSelector, createFeatureSelector } from '@ngrx/store';
import { SensorValue } from './sensor-value.model';
import { SensorConfig, SensorKind, SensorKindType } from './sensor-config.model';
import { Sensor } from './sensor.model';

export const SensorsValueFeatureName = 'sensorsValue';
export const SensorsConfigFeatureName = 'sensorsConfig';

const selectSensorsValue = createFeatureSelector<
    ReadonlyArray<SensorValue>>(SensorsValueFeatureName);

const selectSensorsConfig = createFeatureSelector<
    ReadonlyArray<SensorConfig>>(SensorsConfigFeatureName);

export const selectSensors = createSelector(
    selectSensorsValue,
    selectSensorsConfig,
    (sensorsValue : ReadonlyArray<SensorValue>, sensorsConfig : ReadonlyArray<SensorConfig>) : ReadonlyArray<Sensor> => {
        return sensorsValue.map((sensorValueRaw) => {
            let sensorConfigRaw: SensorConfig = {
                thingId: null,
                name: 'No name',
                id: sensorValueRaw.id,
                relateThing: null,
                kind: SensorKind.Undefined,
                kindType: SensorKindType.Undefined,
                redValueMin: 0,
                redValueMax: 0,
                greenValueMin: 0,
                greenValueMax: 0,
                min: 0,
                max: 0
            }
            const sc = sensorsConfig.find(sensorConfig => sensorValueRaw.id === sensorConfig.id &&
                sensorConfig.relateThing === sensorValueRaw.thingId);
            if (sc)
                sensorConfigRaw = sc;
            return {
                thingId: sensorValueRaw.thingId,
                id: sensorValueRaw.id, // It's equal to sensorConfigRaw.id

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

export const selectSensorsCount = createSelector(
    selectSensors,
    (sensors: ReadonlyArray<Sensor>) => sensors.length)

/* ToDo: To remove
export const selectSensor = createSelector(
    selectSensorsValue,
    (sensorsValue: Array<SensorValue>, props : { thingId: string, sensorsId: string }) =>
        sensorsValue.find((sensorValue) => props.thingId === sensorValue.thingId && props.sensorId === sensorValue.id)
)

export const selectSensor = (thingId: string, sensorId: string) => createSelector(
    selectSensorsValue,
    (sensorsValue: Array<SensorValue>) =>
        sensorsValue.find(sensorValue => thingId === sensorValue.thingId && sensorId === sensorValue.id)
)
*/
