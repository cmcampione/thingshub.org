import { Injectable, OnDestroy, Inject, InjectionToken  } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { AccountService } from './account.service';
import { RealTimeConnectorService } from './real-time-connector.service';

export const THING_KIND = new InjectionToken<string>('ThingKind');

@Injectable()
export class ThingsManagerService implements OnDestroy {

  public readonly mainThing = new thingshub.Thing();
  private readonly thingsManagerClaims = {

    publicReadClaims : thingshub.ThingUserReadClaims.NoClaims,
    publicChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

    everyoneReadClaims: thingshub.ThingUserReadClaims.NoClaims,
    everyoneChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

    creatorUserReadClaims: thingshub.ThingUserReadClaims.AllClaims,
    creatorUserChangeClaims: thingshub.ThingUserChangeClaims.AllClaims
  };
  private readonly thingsDatacontext = new thingshub.ThingsDataContext(endPointAddress, this.accountService.getSecurityHeader);

  public readonly thingsManager: thingshub.ThingsManager;

  private readonly onUpdateThingValue = (thingId, value, asCmd): void => {
  }

  constructor(@Inject(THING_KIND) thingKind: string, private readonly accountService: AccountService,
    private readonly realTimeConnector: RealTimeConnectorService) {

    this.thingsManager = new thingshub.ThingsManager(this.mainThing,
        thingKind,
        this.thingsManagerClaims,
        this.thingsDatacontext,
        this.realTimeConnector.realTimeConnectorRaw);
      this.realTimeConnector.realTimeConnectorRaw.subscribe();
      this.realTimeConnector.realTimeConnectorRaw.setHook('onUpdateThingValue', this.onUpdateThingValue);
  }

  ngOnDestroy() {
    this.realTimeConnector.realTimeConnectorRaw.remHook('onUpdateThingValue', this.onUpdateThingValue);
    this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
  }
}
