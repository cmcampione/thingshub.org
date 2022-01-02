import { createSelector, createFeatureSelector } from '@ngrx/store';
import { SensorConfig, SensorKind, SensorKindType } from './sensor-config.model';
import { Sensor } from './sensor.model';
import { ThingSensor } from './thing-sensor.model';

export const SensorsConfigFeatureName = 'sensorsConfig';
export const ThingsSensorsFeatureName = 'thingsSensors'

const selectSensorsConfig = createFeatureSelector<ReadonlyArray<SensorConfig>>(SensorsConfigFeatureName);

const _selectThingsSensors = createFeatureSelector<ReadonlyArray<ThingSensor>>(ThingsSensorsFeatureName);

export const selectThingsSensors = createSelector(
    _selectThingsSensors,
    selectSensorsConfig,
    (thingsSensors : ReadonlyArray<ThingSensor>, sensorsConfig : ReadonlyArray<SensorConfig>) : ReadonlyArray<ThingSensor> => {
        return thingsSensors.map(thingSensor => {

            const newSensors = thingSensor.sensors.map(sensor => {
                const newSensor: Sensor = { ...sensor };
                const sc = sensorsConfig.find(sensorConfig => sensor.id === sensorConfig.id &&
                    sensorConfig.relateThing === thingSensor.thingId)
                if (sc)
                    newSensor.sensorConfig = { ...sc }
                return newSensor;
            });

            return {
                thingId: thingSensor.thingId,
                name: thingSensor.name,
                sensors: newSensors
            };
        });
    });

export const selectThingsSensorsCount = createSelector(selectThingsSensors, thingsSensors => thingsSensors.length)
