import { Injectable, OnDestroy, Inject, isDevMode  } from '@angular/core';
import { Thing, ThingUserReadClaims, ThingUserChangeClaims, ThingsDataContext, ThingsManager } from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { AccountService } from './account.service';
import { RealTimeConnectorService } from './real-time-connector.service';

@Injectable()
export class ThingsService implements OnDestroy {

  public readonly mainThing = new Thing();
  private readonly thingsManagerClaims = {

    publicReadClaims : ThingUserReadClaims.NoClaims,
    publicChangeClaims: ThingUserChangeClaims.NoClaims,

    everyoneReadClaims: ThingUserReadClaims.NoClaims,
    everyoneChangeClaims: ThingUserChangeClaims.NoClaims,

    creatorUserReadClaims: ThingUserReadClaims.AllClaims,
    creatorUserChangeClaims: ThingUserChangeClaims.AllClaims
  };
  // ToDo: Could be a singleton. Need to create a ThingsDataContextService
  private readonly thingsDatacontext = new ThingsDataContext(endPointAddress, this.accountService.getSecurityHeader);

  // ToDo: Set private
  public readonly thingsManager: ThingsManager;

  private readonly onUpdateThingValue = (thingId: string, value: any, asCmd: boolean): void => {
    if (!isDevMode())
      return;

    console.log('ThingId : ' + thingId);
    console.log('Value   : ' + JSON.stringify(value));
    console.log('asCmd   : ' + asCmd);
  }

  constructor(@Inject('thingKind') thingKind: string,
    private readonly accountService: AccountService,
    // ToDo: Set private
    public readonly realTimeConnector: RealTimeConnectorService) {

    this.thingsManager = new ThingsManager(this.mainThing,
        thingKind,
        this.thingsManagerClaims,
        this.thingsDatacontext,
        this.realTimeConnector.realTimeConnectorRaw);
  }
  public init() {
    this.thingsManager.init();
    this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
  }
  // ToDo: Try to render as private member
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
