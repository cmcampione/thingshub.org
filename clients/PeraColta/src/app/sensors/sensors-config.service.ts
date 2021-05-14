import { Injectable, OnDestroy } from '@angular/core';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';
import { SensorConfig, SensorKind, SensorKindType } from './sensor-config.model';
import { ThingsSensorsConfigService } from './things-sensors-config.service';

interface SensorConfigRaw {
    id: string;
    name: string;
    kind: SensorKind;
    kindType: SensorKindType;
    redValueMin: number;
    redValueMax: number;
    greenValueMin: number;
    greenValueMax: number;
    min: number;
    max: number;
}

@Injectable()
export class SensorsConfigService implements OnDestroy {

    private things: Thing[] = [];// It's only a ref to this.thingsService.mainThing.children
    public sensorsConfig: SensorConfig[] = [];

    constructor(public readonly thingsService: ThingsSensorsConfigService) {
        this.things = this.thingsService.mainThing.children;
    }

    async init(canceler: HttpRequestCanceler) {
        this.thingsService.init();
        await this.thingsService.thingsManager.getMoreThings(canceler);

        this.things.forEach(thing =>
            thing.value.sensors.forEach((sensorConfigRaw: SensorConfigRaw) => {
                // ToDo: Try a copy of objects
                const sensorConfig: SensorConfig = {
                    thingId: thing.id,
                    id: sensorConfigRaw.id,
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
            this.sensorsConfig.push(sensorConfig);
            })
        )
    }
    // ToDo: Try to render as private member
    private done() {
        this.thingsService.done();
    }
    // ToDo: It's not called for Effect cleanup
    ngOnDestroy() {
        this.done();
    }

    public async getAll(): Promise<ReadonlyArray<SensorConfig>> {
        await this.thingsService.thingsManager.getMoreThings(null);// ToDo: why null?
        const sensorsConfig: SensorConfig[] = [];
        this.things.forEach(thing =>
            thing.value.sensorsConfig.forEach((sensorConfigRaw: SensorConfigRaw) => {
                // ToDo: Try to use spread operator
                const sensorConfig: SensorConfig = {
                    thingId: thing.id,
                    id: sensorConfigRaw.id,
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
                sensorsConfig.push(sensorConfig);
            }))
        return sensorsConfig;
    }
}
