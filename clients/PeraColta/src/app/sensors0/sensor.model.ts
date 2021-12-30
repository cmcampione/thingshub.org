
export interface Sensor {
  thingId: string,
  id: string,
  // ToDo: To remove
  name: string,
  now: boolean,
  millis: number,
  value: number
}
