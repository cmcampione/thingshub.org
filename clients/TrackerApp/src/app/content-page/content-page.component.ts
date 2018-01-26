import { Component, OnInit } from '@angular/core';
import { AccountUserData } from 'thingshub-js-sdk';
import { AccountService } from '../account.service';
import { MenuService } from '../menu.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ons-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.css']
})
export class ContentPageComponent implements OnInit {

  private title = 'Hardworking bees are working here';

  private isLoggedIn: boolean = this.accountService.isLoggedIn;

  constructor(private accountService: AccountService, private menuService: MenuService) {
    accountService.isLoggedIn$.subscribe((accountUserData: AccountUserData) => {
      this.isLoggedIn = accountUserData != null;
    });
   }

  ngOnInit() {
  }

  openMenu() {
    this.menuService.open();
  }

}