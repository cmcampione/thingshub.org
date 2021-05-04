import { Injectable } from '@angular/core';
import { AccountService } from '../account.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import { ThingsService } from '../things.service';

@Injectable()
export class ThingsSensorsConfigService extends ThingsService {
    constructor(accountService: AccountService,
        realTimeConnector: RealTimeConnectorService) {
        super('Config', accountService, realTimeConnector );
    }
}