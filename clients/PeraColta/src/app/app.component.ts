import { Component, OnDestroy } from '@angular/core';
import { AccountService } from './account.service';
import { AccountUserData } from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Store } from '@ngrx/store';
import { resetAppState } from './app.actions';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  private readonly subscriptionIsLoggedIn: Subscription = null;
  public isLoggedIn = false;

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private readonly store: Store,
    private accountService: AccountService) {
    this.initializeApp();

    this.subscriptionIsLoggedIn = this.accountService.isLoggedIn$.subscribe(this.checkLogin);
  }
  ngOnDestroy() {
    this.subscriptionIsLoggedIn.unsubscribe();
  }

  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
  }

  async logout() {
    this.store.dispatch(resetAppState());
    try {
      await this.accountService.logout();
    } catch (e) {
      console.log(e);
    }
  }
}
