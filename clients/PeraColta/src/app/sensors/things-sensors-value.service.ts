import { Injectable } from '@angular/core';
import { AccountService } from '../account.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { ThingsService } from '../things.service';

@Injectable()
export class ThingsSensorsValueService extends ThingsService {
    constructor(accountService: AccountService,
        realTimeConnector: RealTimeConnectorService) {
        super('Home appliance', accountService, realTimeConnector );
    }
}