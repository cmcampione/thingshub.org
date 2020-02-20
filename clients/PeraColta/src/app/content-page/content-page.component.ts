import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AccountUserData } from 'thingshub-js-sdk';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import * as thingshub from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';
import { SidePageComponent } from '../side-page/side-page.component'

@Component({
  selector: 'app-home',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  public title = 'Hardworking bees are working here';

  public connectionStatus: thingshub.RealtimeConnectionStates = thingshub.RealtimeConnectionStates.Disconnected;
  private readonly subscriptionIsLoggedIn: Subscription = null;
  private readonly subscriptionRealTimeConnector: Subscription = null;

  private connIconName = 'globe';
  private connIconColor = 'danger';

  @ViewChild(Menu) menu: Menu;

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
        next: (v) => {
          this.connectionStatus = v;
          switch (this.connectionStatus){
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
        }
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
