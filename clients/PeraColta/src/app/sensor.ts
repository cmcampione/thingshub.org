export interface Sensor {
  thingId: string;
  id: string;
  name: string;
  now: boolean;
  millis: number;
  value: number;
}
