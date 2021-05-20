import { Injectable } from '@angular/core';
import { AccountService } from '../account.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { ThingsService } from '../things.service';

// Info: It's used during Effect boot so accountService and realTimeConnector could be uninitialized
@Injectable()
export class ThingsSensorsValueService extends ThingsService {
    constructor(accountService: AccountService,
        realTimeConnector: RealTimeConnectorService) {
        super('Home appliance', accountService, realTimeConnector );
    }
}