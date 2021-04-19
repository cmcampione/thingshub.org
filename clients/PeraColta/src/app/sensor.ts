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

export class Sensor {
  thingId: string;
  id: string;
  // ToDo: To remove
  name: string;
  now: boolean;
  millis: number;
  value: number;
  //
  props: {
    name: string;
    kind: SensorKind;
    kindType: SensorKindType;
    min: number;
    max: number;
  };
  status: {
    now:    boolean;
    millis: number;
    value:  number;
  };
  constructor() {
    this.props = { name: '',
      kind: SensorKind.Undefined,
      kindType: SensorKindType.Undefined,
      min: 0, max: 0
    };
    this.status = {
      now: false,
      millis: 0,
      value: 0
    }
  }
}
