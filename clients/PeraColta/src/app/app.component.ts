import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Store } from '@ngrx/store';
import { resetAppState } from './app.actions';
import { AccountService } from './account.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly subscriptionIsLoggedIn: Subscription = null;
  private isLoggedIn = false; // ToDo: May be removed? Can be useful?

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

  ngOnInit() {
    this.isLoggedIn = this.accountService.isLoggedIn;
  }

  // ToDo: Seems it's never called
  // https://stackoverflow.com/questions/40468267/angular-2-does-ngondestroy-get-called-on-refresh-or-just-when-navigate-away-fr
  ngOnDestroy() {
    this.subscriptionIsLoggedIn.unsubscribe();
  }

  private readonly checkLogin = (isLoggedIn: boolean) => {
    this.isLoggedIn = isLoggedIn;
  }

  // ToDo: Why it is in this component?
  async logout() {
    this.store.dispatch(resetAppState());
    try {
      await this.accountService.logout();
    } catch (e) {
      // Info: Logout error doesn't need to notify any UI message
      console.log(e);
    }
  }
}
