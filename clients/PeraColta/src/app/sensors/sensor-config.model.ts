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
    name: string;
    kind: SensorKind;
    kindType: SensorKindType;
    min: number;
    max: number;
}

