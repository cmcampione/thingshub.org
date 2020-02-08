import { Injectable } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class RealTimeConnectorService {

  private onError(error: any) {
    console.log(error);
  }
  private onConnectError(error: any) {
    console.log(error);
  }
  private onStateChanged(change: any) {
    console.log(change);
  }
  public realTimeConnectorRaw = new thingshub.SocketIORealtimeConnector(
    endPointAddress.server,
    this.accountService.getSecurityToken,
    this.onError, this.onConnectError, this.onStateChanged);

  constructor(private accountService: AccountService) {
    this.realTimeConnectorRaw.subscribe();
   }
}
