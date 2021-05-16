import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountUserData } from 'thingshub-js-sdk';
import { AccountService } from '../account.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import * as thingshub from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  // tslint:disable-next-line: max-line-length
  // It's public for this: https://stackoverflow.com/questions/34574167/angular2-should-private-variables-be-accessible-in-the-template/34574732#34574732

  public title = 'PeraColta - Hardworking bees are working here';

  private connectionStatus: thingshub.RealtimeConnectionStates = thingshub.RealtimeConnectionStates.Disconnected;
  private readonly subscriptionIsLoggedIn: Subscription = null;
  private readonly subscriptionRealTimeConnector: Subscription = null;

  // tslint:disable-next-line: max-line-length
  // They are public for this: https://stackoverflow.com/questions/34574167/angular2-should-private-variables-be-accessible-in-the-template/34574732#34574732

  public connIconName = 'globe';
  public connIconColor = 'danger';

  public isLoggedIn = false;
  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.subscribe();
    } else {
      this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
    }
  }
  private readonly setConnectionIcon = (v: thingshub.RealtimeConnectionStates): void => {
    this.connectionStatus = v;
    switch (this.connectionStatus) {
      case thingshub.RealtimeConnectionStates.Disconnected: {
        this.connIconColor = 'danger';
        break;
      }
      case thingshub.RealtimeConnectionStates.Connected: {
        this.connIconColor = 'primary';
        break;
      }
      case thingshub.RealtimeConnectionStates.Connecting: {
        this.connIconColor = 'warning';
        break;
      }
      case thingshub.RealtimeConnectionStates.Reconnecting: {
        this.connIconColor = 'warning';
        break;
      }
    }
  };

  constructor(private accountService: AccountService,
    private realTimeConnector: RealTimeConnectorService) {
      this.subscriptionIsLoggedIn = this.accountService.isLoggedIn$.subscribe(this.checkLogin);
      this.subscriptionRealTimeConnector = this.realTimeConnector.connectionStatus$.subscribe({
        next: this.setConnectionIcon
      });
  }

  ngOnInit() {
    if (this.isLoggedIn) {
      // ToDo: Seems it's never called
      this.realTimeConnector.realTimeConnectorRaw.subscribe();
    }
  }

  // ToDo: Seems it's never called
  ngOnDestroy() {
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
    }
    this.subscriptionRealTimeConnector.unsubscribe();
    this.subscriptionIsLoggedIn.unsubscribe();
  }
}
