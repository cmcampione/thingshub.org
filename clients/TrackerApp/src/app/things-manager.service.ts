import { Injectable } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { AccountService } from './account.service';
import { RealTimeConnectorService } from './real-time-connector.service';

@Injectable({
  providedIn: 'root'
})
export class ThingsManagerService {

  private mainThing = new thingshub.Thing();
  private thingsManagerClaims = {

    publicReadClaims : thingshub.ThingUserReadClaims.NoClaims,
    publicChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

    everyoneReadClaims: thingshub.ThingUserReadClaims.NoClaims,
    everyoneChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

    creatorUserReadClaims: thingshub.ThingUserReadClaims.AllClaims,
    creatorUserChangeClaims: thingshub.ThingUserChangeClaims.AllClaims
  }
  private thingsDatacontext = new thingshub.ThingsDataContext(endPointAddress, this.accountService.getSecurityHeader);

  private thingsManager = new thingshub.ThingsManager(this.mainThing, 
    "", 
    this.thingsManagerClaims, 
    this.thingsDatacontext, 
    this.realTimeConnector.realTimeConnectorRaw);

  constructor(private accountService: AccountService, 
    private realTimeConnector: RealTimeConnectorService) {
      this.realTimeConnector.realTimeConnectorRaw.subscribe();
    // Uses of "fat arrow" sintax for "this" implicit binding
    this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', (thingId, value, asCmd) => {
     
    });
  }
}
