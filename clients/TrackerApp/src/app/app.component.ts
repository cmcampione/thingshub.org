import { Component } from '@angular/core';
import { AccountService } from './account.service';
import axios from "axios";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Hardworking bees are working here';

  private isLoggedIn = {
    status: this.accountService.isLoggedIn
  };

  constructor(private accountService: AccountService) {
    // Add a response interceptor
    axios.interceptors.response.use(response => {
      // Do something with response data
      return response;
    }, err => {
      if (err.response.status === 401) {
        this.isLoggedIn.status = false;
      }
      return Promise.reject(err);
    });
  }
}
