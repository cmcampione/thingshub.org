import { Injectable, OnDestroy } from '@angular/core';
import { Thing, HttpRequestCanceler } from 'thingshub-js-sdk';
import { SensorValue } from './sensor-value.model';
import { ThingsSensorsValueService } from './things-sensors-value.service';

interface SensorValueRaw {
    id: string;
    now: boolean;
    millis: number;
    value: number;
}

@Injectable()
export class SensorsValueService implements OnDestroy {

    constructor(public readonly thingsService: ThingsSensorsValueService) {
    }

    // ToDo: It's not called for Effect cleanup
    ngOnDestroy() {
        this.thingsService.done();
    }

    public async setSensorValue(thingId: string, sensorValue : SensorValue, value: any): Promise<any> {
        const sensorsValueRaw = { sensors: [value] }
        // asCmd
        return await this.thingsService.putThingValue({ thingId, asCmd: true, value: sensorsValueRaw });
    }
}
