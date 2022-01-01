import { createSelector, createFeatureSelector } from '@ngrx/store';
import { SensorConfig, SensorKind, SensorKindType } from './sensor-config.model';
import { ThingSensor } from './thing-sensor.model';

export const SensorsConfigFeatureName = 'sensorsConfig';
export const ThingsSensorsFeatureName = 'thingsSensors'

const selectSensorsConfig = createFeatureSelector<
    ReadonlyArray<SensorConfig>>(SensorsConfigFeatureName);

const _selectThingsSensors = createFeatureSelector<
    ReadonlyArray<ThingSensor>>(ThingsSensorsFeatureName);

export const selectThingsSensors = createSelector(
    _selectThingsSensors,
    selectSensorsConfig,
    (thingsSensors : ReadonlyArray<ThingSensor>, sensorsConfig : ReadonlyArray<SensorConfig>) : ReadonlyArray<ThingSensor> => {
        return thingsSensors.map(thingSensor => {
            thingSensor.sensors.forEach(sensor => {
                let sensorConfigDef: SensorConfig = {
                    thingId: null,
                    name: 'No name',
                    id: sensor.id,
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
                const sc = sensorsConfig.find(sensorConfig => sensor.id === sensorConfig.id &&
                    sensorConfig.relateThing === thingSensor.id);
                if (sc)
                    sensorConfigDef = sc;
                sensor.sensorConfig = sensorConfigDef;
            });
            return thingSensor
        });
    });

export const selectThingsSensorsCount = createSelector(
    selectThingsSensors,
    (thingsSensors: ReadonlyArray<ThingSensor>) => thingsSensors.length)

