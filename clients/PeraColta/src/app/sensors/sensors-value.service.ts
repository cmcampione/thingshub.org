import { Injectable, OnDestroy } from '@angular/core';
import { ThingsService } from '../things.service';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';
import { SensorValue } from './sensor-value.model';

interface SensorValueRaw {
    id: string;
    now: boolean;
    millis: number;
    value: number;
}

@Injectable()
export class SensorsValueService implements OnDestroy {

    private things: Thing[] = [];// It's only a ref to this.thingsService.mainThing.children


    constructor(public readonly thingsService: ThingsService) {
        this.things = this.thingsService.mainThing.children;
    }

    private searchThingById(id: string): Thing {
        return this.things.find((thing) => {
            return thing.id === id;
        })
    }

    done() {
        this.thingsService.done();
    }
    // ToDo: It's not called see https://github.com/angular/angular/issues/28857
    ngOnDestroy() {
        this.done();
    }

    public async getAll(): Promise<ReadonlyArray<SensorValue>> {
        await this.thingsService.thingsManager.getMoreThings(null);// ToDo: why null?
        const sensorsValue: SensorValue[] = [];
        this.things.forEach(thing =>
            thing.value.sensors.forEach((sensorRaw: SensorValueRaw) => {
                // ToDo: Try to use spread operator
                const sensor: SensorValue = {
                    thingId: thing.id,
                    id: sensorRaw.id,
                    now: sensorRaw.now,
                    millis: sensorRaw.millis,
                    value: sensorRaw.value
                }
                sensorsValue.push(sensor);
            }))
        return sensorsValue;
    }

    public async setSensorValue(sensorValue : SensorValue, value: any): Promise<any> {
        const thing: Thing = this.searchThingById(sensorValue.thingId);
        if (!thing)
            return; // Sanity check
        const sensorsValueRaw = { sensors: [value] }
        // asCmd
        return await this.thingsService.putThingValue({ thingId: thing.id, asCmd: true, value: sensorsValueRaw });
    }
}
