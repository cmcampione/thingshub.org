import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountUserData } from 'thingshub-js-sdk';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';
import { RealTimeConnectorService } from '../real-time-connector.service';
import * as thingshub from 'thingshub-js-sdk';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ons-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit, OnDestroy {

  public title = 'Hardworking bees are working here';

  public connectionStatus: thingshub.RealtimeConnectionStates = thingshub.RealtimeConnectionStates.Disconnected;

  public isLoggedIn: boolean = this.accountService.isLoggedIn;

  constructor(private accountService: AccountService, 
    private menuService: MenuService,
    private realTimeConnector: RealTimeConnectorService) {
    accountService.isLoggedIn$.subscribe((accountUserData: AccountUserData) => {
      this.isLoggedIn = accountUserData != null;
      if (this.isLoggedIn) {
        this.realTimeConnector.realTimeConnectorRaw.subscribe();
      }
      else {
        // ToTry better
        this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
      }
    });
    this.realTimeConnector.connectionStatus.subscribe({
      next: (v) => this.connectionStatus = v
    });
   }
   
  ngOnInit() {
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.subscribe();
    }   
  }

  openMenu() {
    this.menuService.open();
  }

  ngOnDestroy() {   
    if (this.isLoggedIn) {
      this.realTimeConnector.realTimeConnectorRaw.unsubscribe();
    }    
  }
}
