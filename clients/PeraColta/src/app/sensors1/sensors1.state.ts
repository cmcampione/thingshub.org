import { Sensor1Value } from './sensor1-value.model';
import { Sensor1Config } from './sensor1-config.model';

export interface Sensors1State {
    sensors1Value: ReadonlyArray<Sensor1Value>;
    sensors1Config: ReadonlyArray<Sensor1Config>;
}