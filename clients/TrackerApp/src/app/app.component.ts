import { Component } from '@angular/core';
import { AccountService } from './account.service';

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
  }
}
