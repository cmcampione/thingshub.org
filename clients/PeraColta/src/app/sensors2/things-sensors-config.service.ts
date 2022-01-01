import { Injectable } from '@angular/core';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { ThingsService } from '../things.service';
import { Sensors2Module } from './sensors.module';

// Info: It's used during Effect boot so accountService and realTimeConnector could be uninitialized
@Injectable()
export class ThingsSensorsConfigService extends ThingsService {
    constructor(realTimeConnector: RealTimeConnectorService) {
        super('Config', realTimeConnector );
    }
}
