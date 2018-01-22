import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import * as ons from 'onsenui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private username = '';
  private password = '';
  private remember = this.accountService.remember;

  constructor(private accountService: AccountService) {
  }

  ngOnInit() {
  }

  private async login() {
    try {
      if (!this.username || !this.password) {
        ons.notification.toast('Incorrect username or password', {
          timeout: 2000,
          modifier: 'danger',
          animation: 'fall'
        });
        return;
      }
      const loginData = await this.accountService.login(this.username, this.password, this.remember);
    } catch (e) {
      const msg = (e instanceof Error) ? e.message : e.data.message;
      ons.notification.toast(msg, {
        timeout: 2000,
        modifier: 'danger',
        animation: 'fall'
      });
    }
  }
}


