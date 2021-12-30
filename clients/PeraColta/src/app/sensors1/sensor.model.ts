import { SensorConfig } from './sensor-config.model';
import { SensorValue } from './sensor-value.model';
export interface Sensor {
  thingId: string,
  id: string,

  sensorConfig: SensorConfig,
  sensorValue : SensorValue
}
