//

export enum SensorKind {
    Undefined = 0,
    Analogic,
    Digital
}

export enum SensorKindType {
    Undefined = 0,
    Input,
    Output,
    InputOutput
}
export interface SensorConfig {
    thingId: string;
    id: string;
    relateThing: string;
    name: string;
    kind: SensorKind;
    kindType: SensorKindType;
    redValueMin: number;
    redValueMax: number;
    greenValueMin: number;
    greenValueMax: number;
    min: number; // For SensorKind.Digital its value is 0
    max: number; // For SensorKind.Digital its value is 1
}

