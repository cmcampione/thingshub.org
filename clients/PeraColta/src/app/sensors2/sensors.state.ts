import { SensorValue } from './sensor-value.model';
import { SensorConfig } from './sensor-config.model';
import { ThingSensor } from './thing-sensor.model';

export interface SensorsState {
    sensorsConfig: ReadonlyArray<SensorConfig>;
    thingsSensors: ReadonlyArray<ThingSensor>;
}