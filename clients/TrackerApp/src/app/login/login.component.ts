import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private username: string;
  private password: string;

  constructor(private accountService: AccountService) {
  }

  ngOnInit() {
  }

  private async login() {
    try {
      const loginData = await this.accountService.login(this.username, this.password, false);
    } catch (e) {
      console.log(e);
    }
  }
}
