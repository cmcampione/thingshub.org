import { Component, OnInit, Input } from '@angular/core';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private username: string;
  private password: string;
  
  @Input() isLoggedIn;

  constructor(private accountService: AccountService) {
    
  }

  ngOnInit() {
  }

  private async login() {

    try {
      let loginData = await this.accountService.login(this.username, this.password, false);
      this.isLoggedIn.status = this.accountService.isLoggedIn;
    }
    catch(e){
      console.log(e);
    }
  }
}
