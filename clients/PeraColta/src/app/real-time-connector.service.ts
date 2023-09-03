import { Injectable } from '@angular/core';
import { SocketIORealtimeConnector } from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { AccountService } from './account.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root' // It's one and only one
})
export class RealTimeConnectorService {

  constructor(private accountService: AccountService) {
  }

  public readonly connectionStatus$ = new Subject<thingshub.RealtimeConnectionStates>();

  private readonly onError = (error: any) => {
    console.log(error);
  }
  private readonly onConnectError = (error: any) => {
    console.log(error);
  }
  private readonly onStateChanged = (change: thingshub.RealtimeConnectionStates): void => {
    this.connectionStatus$.next(change);
  };

  // ToDo: Could be injected to chance connection type
  // tslint:disable-next-line: member-ordering
  public readonly realTimeConnectorRaw = new SocketIORealtimeConnector(
    endPointAddress.server,
    this.accountService.getSecurityToken,
    this.onError, this.onConnectError, this.onStateChanged);

}
