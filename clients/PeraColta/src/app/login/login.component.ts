import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
// import * as ons from 'onsenui';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username = '';
  public password = '';
  public remember = this.accountService.remember;

  constructor(private accountService: AccountService) {
  }

  ngOnInit() {
  }

  public async login() {
    try {
      if (!this.username || !this.password) {
        /* ons.notification.toast('Incorrect username or password', {
          timeout: 2000,
          modifier: 'danger',
          animation: 'fall'
        }); */
        return;
      }
      const loginData = await this.accountService.login(this.username, this.password, this.remember);
    } catch (e) {
      this.username = '';
      const msg = (e instanceof Error) ? e.message : e.data.message;
      /* ons.notification.toast(msg, {
        timeout: 2000,
        modifier: 'danger',
        animation: 'fall'
      }); */
    } finally {
      this.password = '';
    }
  }
}
