import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from '../account.service';
import { AccountUserData } from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'ons-page',
  templateUrl: './side-page.component.html',
  styleUrls: ['./side-page.component.css']
})
export class SidePageComponent implements OnInit, OnDestroy {

  private readonly subscriptionIsLoggedIn: Subscription = null;
  public isLoggedIn = false;
  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
  }

  constructor(private menu: MenuController, private accountService: AccountService) {
    this.subscriptionIsLoggedIn = this.accountService.isLoggedIn.subscribe(this.checkLogin);
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.subscriptionIsLoggedIn.unsubscribe();
  }

  open() {
    this.menu.enable(true, 'main-content');
    this.menu.open('main-content');
  }
}
