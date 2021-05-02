import { SensorValue } from '../sensor-value.model';
import { SensorConfig } from '../sensor-config.model';

export interface AppState {
    sensorsValue: ReadonlyArray<SensorValue>;
    sensorsConfig: ReadonlyArray<SensorConfig>;
}