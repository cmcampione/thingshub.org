import { Component, ViewChild, OnDestroy } from '@angular/core';
import { MenuService } from './menu.service';
import { AccountService } from './account.service';
import { AccountUserData } from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  private readonly subscriptionIsLoggedIn: Subscription = null;
  private readonly subscriptionMenuToggle: Subscription = null;
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
    private accountService: AccountService,
    private menuService: MenuService) {
    this.initializeApp();

    this.subscriptionIsLoggedIn = this.accountService.isLoggedIn.subscribe(this.checkLogin);
    // this.subscriptionMenuToggle = this.menuService.toggle.subscribe(() => this.splitter.nativeElement.side.open());
  }
  ngOnDestroy() {
    this.subscriptionMenuToggle.unsubscribe();
    this.subscriptionIsLoggedIn.unsubscribe();
  }

  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
  }
}
