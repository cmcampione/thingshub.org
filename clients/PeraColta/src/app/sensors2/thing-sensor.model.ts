import { Sensor } from './sensor.model';

export interface ThingSensor {
    thingId: string;
    name: string;
    sensors: Sensor[]; // ToDo: Should be a ReadonlyArray
}

