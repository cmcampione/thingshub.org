//

export enum Sensor1Kind {
    Undefined = 0,
    Analogic,
    Digital
}

export enum Sensor1KindType {
    Undefined = 0,
    Input,
    Output,
    InputOutput
}
export interface Sensor1Config {
    thingId: string;
    id: string;
    relateThing: string;
    name: string;
    kind: Sensor1Kind;
    kindType: Sensor1KindType;
    redValueMin: number;
    redValueMax: number;
    greenValueMin: number;
    greenValueMax: number;
    min: number; // For SensorKind.Digital its value is 0
    max: number; // For SensorKind.Digital its value is 1
}

