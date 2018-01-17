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
  private remember = true;

  constructor(private accountService: AccountService) {
  }

  ngOnInit() {
  }

  private async login() {
    try {
      const loginData = await this.accountService.login(this.username, this.password, this.remember);
    } catch (e) {
      ons.notification.toast('Username or password incorrect', {
        timeout: 2000,
        modifier: "danger",
        animation: 'fall'
      });
    }
  }
}


