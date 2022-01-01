import { Sensor } from "./sensor.model";

export interface ThingSensor {
    id: string;
    name: string;
    sensors: Sensor[];
}

