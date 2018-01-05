import axios from 'axios';
import { Component } from '@angular/core';
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

    accountService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
    });
  }
}
