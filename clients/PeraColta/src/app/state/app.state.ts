import { SensorValue } from '../sensors/sensor-value.model';
import { SensorConfig } from '../sensors/sensor-config.model';
export interface AppState {
    sensorsValue: ReadonlyArray<SensorValue>;
    sensorsConfig: ReadonlyArray<SensorConfig>;
}