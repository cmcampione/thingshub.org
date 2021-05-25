import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../account.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import * as thingshub from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectSensorsCount as selectSensorsCount, selectSensors } from '../sensors/sensors.selectors';
import { getAllSensorsConfig } from '../sensors/sensors-config.actions';
import { getAllSensorsValue } from '../sensors/sensors-value.actions';

@Component({
  selector: 'app-home',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  // tslint:disable-next-line: max-line-length
  // It's public for this: https://stackoverflow.com/questions/34574167/angular2-should-private-variables-be-accessible-in-the-template/34574732#34574732
  public title = 'PeraColta - Hardworking bees are working here';

  private readonly subscriptionIsLoggedIn: Subscription = null;

  private connectionStatus: thingshub.RealtimeConnectionStates = thingshub.RealtimeConnectionStates.Disconnected;
  private readonly subscriptionRealTimeConnector: Subscription = null;

  // tslint:disable-next-line: max-line-length
  // They are public for this: https://stackoverflow.com/questions/34574167/angular2-should-private-variables-be-accessible-in-the-template/34574732#34574732
  public connIconName = 'globe';
  public connIconColor = 'danger';
  public isLoggedIn: boolean = false;

  public sensorsCount$ = this.store.pipe(select(selectSensorsCount));

  private readonly checkLogin = (isLoggedIn: boolean) => {
    this.isLoggedIn = isLoggedIn;
    if (this.isLoggedIn) {      
      this.realTimeConnector.realTimeConnectorRaw.subscribe();

      // Reducers are pure functions in that they produce the same output for a given input.
      // They are without side effects and handle each state transition synchronously.
      // Each reducer function takes the latest Action dispatched, the current state,
      // and determines whether to return a newly modified state or the original state.
      // https://ngrx.io/guide/store/reducers

      // Below methods are here because we need to know the number of sensors before SensorsComponent is displayed
      this.store.dispatch(getAllSensorsConfig()); // It is syncronous as abose comment
      this.store.dispatch(getAllSensorsValue());  // It is syncronous as abose comment
    } else {
      // ToDo: Arrive before other components can remhook from realtime connector
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

  constructor(private readonly store: Store,
    private accountService: AccountService,
    private realTimeConnector: RealTimeConnectorService) {
      this.subscriptionIsLoggedIn = this.accountService.isLoggedIn$.subscribe(this.checkLogin);
      this.subscriptionRealTimeConnector = this.realTimeConnector.connectionStatus$.subscribe({
        next: this.setConnectionIcon
      });
  }

  ngOnInit() {
    this.isLoggedIn = this.accountService.isLoggedIn;
    // Info: Useful when a page refresh occurs and the access token is still valid
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.subscribe();

      // Reducers are pure functions in that they produce the same output for a given input.
      // They are without side effects and handle each state transition synchronously.
      // Each reducer function takes the latest Action dispatched, the current state,
      // and determines whether to return a newly modified state or the original state.
      // https://ngrx.io/guide/store/reducers

      // Below methods are here because we need to know the number of sensors before SensorsComponent is displayed
      this.store.dispatch(getAllSensorsConfig()); // It is syncronous as abose comment
      this.store.dispatch(getAllSensorsValue());  // It is syncronous as abose comment
    }
  }

  // ToDo: Seems it's never called
  // https://stackoverflow.com/questions/40468267/angular-2-does-ngondestroy-get-called-on-refresh-or-just-when-navigate-away-fr
  ngOnDestroy() {
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
    }
    this.subscriptionRealTimeConnector.unsubscribe();
    this.subscriptionIsLoggedIn.unsubscribe();
  }
}
