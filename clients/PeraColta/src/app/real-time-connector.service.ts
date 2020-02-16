import { Injectable } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { AccountService } from './account.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealTimeConnectorService {

  public readonly connectionStatus = new Subject<thingshub.RealtimeConnectionStates>();

  private readonly onStateChanged = (change: thingshub.RealtimeConnectionStates): void => {
    this.connectionStatus.next(change);
  };

  // ToDo: To trasform like onStateChanged
  private onError(error: any) {
    console.log(error);
  }
  // ToDo: To trasform like onStateChanged
  private onConnectError(error: any) {
    console.log(error);
  }

  // ToDo: Could be injected to chande connection type
  public readonly realTimeConnectorRaw = new thingshub.SocketIORealtimeConnector(
    endPointAddress.server,
    this.accountService.getSecurityToken,
    this.onError, this.onConnectError, this.onStateChanged);

  constructor(private accountService: AccountService) {    
  }
}
