import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountUserData } from 'thingshub-js-sdk';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import * as thingshub from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ons-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  public title = 'Hardworking bees are working here';

  public connectionStatus: thingshub.RealtimeConnectionStates = thingshub.RealtimeConnectionStates.Disconnected;
  private readonly subscriptionIsLoggedIn: Subscription = null;
  private readonly subscriptionRealTimeConnector: Subscription = null;

  public isLoggedIn = false;
  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.subscribe();
    } else {
      // ToDo: ToTry better
      this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
    }
  }

  constructor(private accountService: AccountService,
    private menuService: MenuService,
    private realTimeConnector: RealTimeConnectorService) {
      this.subscriptionIsLoggedIn = this.accountService.isLoggedIn.subscribe(this.checkLogin);
      this.subscriptionRealTimeConnector = this.realTimeConnector.connectionStatus.subscribe({
        next: (v) => this.connectionStatus = v
      });
  }

  ngOnInit() {
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.subscribe();
    }
  }
  ngOnDestroy() {
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
    }
    this.subscriptionRealTimeConnector.unsubscribe();
    this.subscriptionIsLoggedIn.unsubscribe();
  }

  openMenu() {
    this.menuService.open();
  }
  async logout() {
    try {
      await this.accountService.logout();
    } catch (e) {
      console.log(e);
    }
  }
}
