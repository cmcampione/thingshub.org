import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Sensor1Value } from './sensor1-value.model';
import { Sensor1Config, Sensor1Kind, Sensor1KindType } from './sensor1-config.model';
import { Sensor1 } from './sensor1.model';

export const Sensors1ValueFeatureName = 'sensors1Value';
export const Sensors1ConfigFeatureName = 'sensors1Config';

const selectSensors1Value = createFeatureSelector<
    ReadonlyArray<Sensor1Value>>(Sensors1ValueFeatureName);

const selectSensors1Config = createFeatureSelector<
    ReadonlyArray<Sensor1Config>>(Sensors1ConfigFeatureName);

export const selectSensors1 = createSelector(
    selectSensors1Value,
    selectSensors1Config,
    (sensorsValue : ReadonlyArray<Sensor1Value>, sensorsConfig : ReadonlyArray<Sensor1Config>) : ReadonlyArray<Sensor1> => {
        return sensorsValue.map((sensorValueRaw) => {
            let sensorConfigRaw: Sensor1Config = {
                thingId: null,
                name: 'No name',
                id: sensorValueRaw.id,
                relateThing: null,
                kind: Sensor1Kind.Undefined,
                kindType: Sensor1KindType.Undefined,
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

export const selectSensors1Count = createSelector(
    selectSensors1,
    (sensors: ReadonlyArray<Sensor1>) => sensors.length)

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
