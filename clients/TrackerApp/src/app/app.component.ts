import axios from 'axios';
import { Component } from '@angular/core';
import { AccountService } from './account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'Hardworking bees are working here';

  private isLoggedIn: boolean = this.accountService.isLoggedIn;

  constructor(private accountService: AccountService) {
    axios.interceptors.response.use(response => {
      return response;
    }, err => {
      if (err.response.status === 401) {
        if (this.isLoggedIn === true) {
          // this.accountService.reset();
          // this.isLoggedIn = this.accountService.isLoggedIn;
          this.isLoggedIn = false;
        }
      }
      return Promise.reject(err);
    });
  }

  public loginStatusChange(event) {
    this.isLoggedIn = this.accountService.isLoggedIn;
  }
}
