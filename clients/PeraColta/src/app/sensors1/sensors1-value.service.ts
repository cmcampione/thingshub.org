import { Injectable, OnDestroy } from '@angular/core';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';
import { Sensor1Value } from './sensor1-value.model';
import { ThingsSensors1ValueService } from './things-sensors1-value.service';

interface SensorValueRaw {
    id: string;
    now: boolean;
    millis: number;
    value: number;
}

@Injectable()
export class SensorsValueService implements OnDestroy {

    private things: Thing[] = [];// It will be only a ref to this.thingsService.mainThing.children

    constructor(public readonly thingsService: ThingsSensors1ValueService) {
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

    public async getAll(): Promise<ReadonlyArray<Sensor1Value>> {
        await this.thingsService.thingsManager.getMoreThings(null);// ToDo: why null?
        const sensorsValue: Sensor1Value[] = [];
        this.things.forEach(thing => {
            if (thing.value && thing.value.sensors)
                thing.value.sensors.forEach((sensorRaw: SensorValueRaw) => {
                    // ToDo: Try to use spread operator
                    const sensor: Sensor1Value = {
                        thingId: thing.id,
                        id: sensorRaw.id,
                        now: sensorRaw.now,
                        millis: sensorRaw.millis,
                        value: sensorRaw.value
                    }
                    sensorsValue.push(sensor);
                })
        })
        return sensorsValue;
    }

    public async setSensorValue(sensorValue : Sensor1Value, value: any): Promise<any> {
        const thing: Thing = this.searchThingById(sensorValue.thingId);
        if (!thing)
            return; // Sanity check
        const sensorsValueRaw = { sensors: [value] }
        // asCmd
        return await this.thingsService.putThingValue({ thingId: thing.id, asCmd: true, value: sensorsValueRaw });
    }
}
