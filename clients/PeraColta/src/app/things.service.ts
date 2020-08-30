import { Injectable, OnDestroy, Inject, isDevMode  } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { ThingsGetParams, HttpRequestCanceler, ThingsDTOsDataSet } from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { AccountService } from './account.service';
import { RealTimeConnectorService } from './real-time-connector.service';

// it's no iniectable because keep things state
@Injectable()
export class ThingsService implements OnDestroy {

  public readonly mainThing = new thingshub.Thing();
  private readonly thingsManagerClaims = {

    publicReadClaims : thingshub.ThingUserReadClaims.NoClaims,
    publicChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

    everyoneReadClaims: thingshub.ThingUserReadClaims.NoClaims,
    everyoneChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

    creatorUserReadClaims: thingshub.ThingUserReadClaims.AllClaims,
    creatorUserChangeClaims: thingshub.ThingUserChangeClaims.AllClaims
  };
  // ToDo: Could be a singleton. Need to create a ThingsDataContextService
  private readonly thingsDatacontext = new thingshub.ThingsDataContext(endPointAddress, this.accountService.getSecurityHeader);

  public readonly thingsManager: thingshub.ThingsManager;

  private readonly onUpdateThingValue = (thingId: string, value: any, asCmd: boolean): void => {
    if (!isDevMode())
      return;

    console.log('ThingId : ' + thingId);
    console.log('Value   : ' + JSON.stringify(value));
    console.log('asCmd   : ' + asCmd);
  }

  constructor(@Inject('thingKind') thingKind: string, private readonly accountService: AccountService,
    public readonly realTimeConnector: RealTimeConnectorService) {

    this.thingsManager = new thingshub.ThingsManager(this.mainThing,
        thingKind,
        this.thingsManagerClaims,
        this.thingsDatacontext,
        this.realTimeConnector.realTimeConnectorRaw);
  }
  public init() {
    this.thingsManager.init();
    this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
  }
  public done() {
    this.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
    this.thingsManager.done();
  }
  ngOnDestroy() {
    this.done();
  }

  // Only simple wrappers to "thingsDatacontext"

  public async putThingValue({ thingId, asCmd, value }: { thingId: string; asCmd: boolean; value: any; })
    : Promise<any> {
    return await this.thingsManager.putThingValue(thingId, asCmd, value);
  }
}
