import { Injectable, OnDestroy } from '@angular/core';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';
import { Sensor1Config, Sensor1Kind, Sensor1KindType } from './sensor1-config.model';
import { ThingsSensors1ConfigService } from './things-sensors1-config.service';

interface SensorConfigRaw {
    id: string;
    name: string;
    kind: Sensor1Kind;
    kindType: Sensor1KindType;
    redValueMin: number;
    redValueMax: number;
    greenValueMin: number;
    greenValueMax: number;
    min: number;
    max: number;
}

@Injectable()
export class Sensors1ConfigService implements OnDestroy {

    private things: Thing[] = [];// It's only a ref to this.thingsService.mainThing.children

    constructor(public readonly thingsService: ThingsSensors1ConfigService) {
        this.things = this.thingsService.mainThing.children;
    }
    // ToDo: It's not called for Effect cleanup
    ngOnDestroy() {
        this.thingsService.done();
    }

    public async getAll(): Promise<ReadonlyArray<Sensor1Config>> {
        await this.thingsService.thingsManager.getMoreThings(null);// ToDo: why null?
        const sensorsConfig: Sensor1Config[] = [];
        this.things.forEach(thing => {
            if (thing.value && thing.value.sensorsConfig)
                thing.value.sensorsConfig.forEach((sensorConfigRaw: SensorConfigRaw) => {
                    // ToDo: Try to use spread operator
                    const sensorConfig: Sensor1Config = {
                        thingId: thing.id,
                        id: sensorConfigRaw.id,
                        relateThing: thing.value.relateThing,
                        name: sensorConfigRaw.name,
                        kind: sensorConfigRaw.kind,
                        kindType: sensorConfigRaw.kindType,
                        redValueMin: sensorConfigRaw.redValueMin,
                        redValueMax: sensorConfigRaw.redValueMax,
                        greenValueMin: sensorConfigRaw.greenValueMin,
                        greenValueMax: sensorConfigRaw.greenValueMax,
                        min: sensorConfigRaw.min,
                        max: sensorConfigRaw.max
                    }
                    sensorsConfig.push(sensorConfig);})
                })
        return sensorsConfig;
    }
}
