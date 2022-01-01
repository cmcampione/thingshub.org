import { Injectable } from '@angular/core';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { ThingsService } from '../things.service';

// Info: It's used during Effect boot so accountService and realTimeConnector could be uninitialized
@Injectable()
export class ThingsSensors1ConfigService extends ThingsService {
    constructor(realTimeConnector: RealTimeConnectorService) {
        super('Config', realTimeConnector );
    }
}