import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AppState } from './app.state';
import { SensorValue } from '../sensors/sensor-value.model';
import { SensorConfig, SensorKind, SensorKindType } from '../sensors/sensor-config.model';
import { Sensor } from '../sensors/sensor.model';

const selectSensorsValue = createFeatureSelector<
    AppState,
    ReadonlyArray<SensorValue>>('sensorsValue'); // ToDo: avoid hard coded string

const selectSensorsConfig = createFeatureSelector<
    AppState,
    ReadonlyArray<SensorConfig>>('sensorsConfig'); // ToDo: avoid hard coded string

export const selectSensors = createSelector(
    selectSensorsValue,
    selectSensorsConfig,
    (sensorsValue : ReadonlyArray<SensorValue>, sensorsConfig : ReadonlyArray<SensorConfig>) : ReadonlyArray<Sensor> => {
        return sensorsValue.map((sensorValueRaw) => {
            let sensorConfigRaw: SensorConfig = {
                thingId: null,
                name: 'No name',
                id: sensorValueRaw.id,
                kind: SensorKind.Undefined,
                kindType: SensorKindType.Undefined,
                min: 0,
                max: 0
            }
            // ToDo: Id must be unique for all sensors and relate config
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
