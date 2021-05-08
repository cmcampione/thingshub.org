import { SensorConfig, SensorKind, SensorKindType } from './sensor-config.model';
import { SensorValue } from './sensor-value.model';
export interface Sensor {
  thingId: string,
  id: string,
  // ToDo: To remove
  name: string,
  now: boolean,
  millis: number,
  value: number,

  sensorConfig: SensorConfig,
  sensorValue : SensorValue
}
