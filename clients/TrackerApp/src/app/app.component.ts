import { Component } from '@angular/core';
import { AccountUserData } from 'thingshub-js-sdk';
import { AccountService } from './account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private title = 'Hardworking bees are working here';

  private isLoggedIn: boolean = this.accountService.isLoggedIn;

  constructor(private accountService: AccountService) {

    accountService.isLoggedIn$.subscribe((accountUserData: AccountUserData) => {
      this.isLoggedIn = accountUserData != null;
    });
  }
}
