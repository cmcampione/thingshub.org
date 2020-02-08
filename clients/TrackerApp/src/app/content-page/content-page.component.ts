import { Component, OnInit } from '@angular/core';
import { AccountUserData } from 'thingshub-js-sdk';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { RealTimeConnectorService } from '../real-time-connector.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ons-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit {

  public title = 'Hardworking bees are working here';

  public isLoggedIn: boolean = this.accountService.isLoggedIn;

  constructor(private accountService: AccountService, 
    private realTimeConnector: RealTimeConnectorService,
    private menuService: MenuService) {
    accountService.isLoggedIn$.subscribe((accountUserData: AccountUserData) => {
      this.isLoggedIn = accountUserData != null;
    });
   }

  ngOnInit() {
  }

  openMenu() {
    this.menuService.open();
  }

  OnDestroy() {
    //this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
  }
}
