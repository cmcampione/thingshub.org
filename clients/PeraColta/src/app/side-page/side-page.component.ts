import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { AccountUserData } from 'thingshub-js-sdk';

@Component({
  selector: 'ons-page',
  templateUrl: './side-page.component.html',
  styleUrls: ['./side-page.component.css']
})
export class SidePageComponent implements OnInit {

  public isLoggedIn: boolean = false;
  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
  };

  constructor(private accountService: AccountService) {
    this.accountService.isLoggedIn.subscribe(this.checkLogin);
  }

  ngOnInit() {
  }

}
