export interface Sensor {
  thingId: string;
  id: string;
  name: string;
  now: boolean;
  millis: number;
  value: number;
  //
  props: {
    name: string;
  };
  status: {
    now: boolean;
    millis: number;
    value: number;
  }
}
