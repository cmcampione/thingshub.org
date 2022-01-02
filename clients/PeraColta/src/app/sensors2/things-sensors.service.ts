import { Injectable, OnDestroy } from '@angular/core';

import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';
import { SensorKind, SensorKindType } from './sensor-config.model';
import { Sensor } from './sensor.model';
import { ThingSensor } from './thing-sensor.model';
import { ThingsSensorsThingService } from './things-sensors-thing.service';

// ToDo: Move up
interface SensorValueRaw {
    id: string;
    now: boolean;
    millis: number;
    value: number;
}

@Injectable()
export class ThingsSensorsService implements OnDestroy {

    private things: Thing[] = [];// It will be only a ref to this.thingsService.mainThing.children

    constructor(public readonly thingsService: ThingsSensorsThingService) {
        this.things = this.thingsService.mainThing.children;
    }

    private searchThingById(id: string): Thing {
        return this.things.find((thing) => {
            return thing.id === id;
        })
    }

    // ToDo: It's not called for Effect cleanup
    ngOnDestroy() {
        this.thingsService.done();
    }

    public async getAll(): Promise<ReadonlyArray<ThingSensor>> {
        await this.thingsService.thingsManager.getMoreThings(null);// ToDo: why null?
        const thingsSensors: ThingSensor[] = [];
        this.things.forEach(thing => {
            const thingSensor: ThingSensor = {
                thingId: thing.id,
                name: thing.name,
                sensors: []
            }
            if (thing.value && thing.value.sensors)
                thing.value.sensors.forEach((sensorRaw: SensorValueRaw) => {
                    // ToDo: Try to use spread operator
                    const sensor: Sensor = {
                        id: sensorRaw.id,
                        sensorConfig: {
                            thingId: null,
                            name: 'No name',
                            id: sensorRaw.id,
                            relateThing: thing.id,
                            kind: SensorKind.Undefined,
                            kindType: SensorKindType.Undefined,
                            redValueMin: 0,
                            redValueMax: 0,
                            greenValueMin: 0,
                            greenValueMax: 0,
                            min: 0,
                            max: 0
                        },
                        sensorValue: {
                            now: sensorRaw.now,
                            millis: sensorRaw.millis,
                            value: sensorRaw.value
                        }
                    }
                    thingSensor.sensors.push(sensor);
                })
            thingsSensors.push(thingSensor);
        })
        return thingsSensors;
    }

    public async setSensorValue(thingSensor : ThingSensor, value: any): Promise<any> {
        const thing: Thing = this.searchThingById(thingSensor.thingId);
        if (!thing)
            return; // Sanity check
        const sensorsValueRaw = { sensors: [value] }
        // asCmd
        return await this.thingsService.putThingValue({ thingId: thing.id, asCmd: true, value: sensorsValueRaw });
    }
}
