import { Sensor1Config } from './sensor1-config.model';
import { Sensor1Value } from './sensor1-value.model';
export interface Sensor1 {
  thingId: string,
  id: string,

  sensorConfig: Sensor1Config,
  sensorValue : Sensor1Value
}
