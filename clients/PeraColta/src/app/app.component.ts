import { Component, ViewChild, OnDestroy } from '@angular/core';
import { SidePageComponent } from './side-page/side-page.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { MenuService } from './menu.service';
import { AccountService } from './account.service';
import { AccountUserData } from 'thingshub-js-sdk';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

  public sidePage    = SidePageComponent;
  public contentPage = ContentPageComponent;

  private readonly subscriptionIsLoggedIn: Subscription = null;
  private readonly subscriptionMenuToggle: Subscription = null;

  @ViewChild('splitter', {static: false}) splitter;

  public isLoggedIn: boolean = false;
  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
  };
  
  constructor(private accountService: AccountService, private menuService: MenuService) {
    this.subscriptionIsLoggedIn = this.accountService.isLoggedIn.subscribe(this.checkLogin);
    this.subscriptionMenuToggle = this.menuService.toggle.subscribe(() => this.splitter.nativeElement.side.open());
  }

  ngOnDestroy() {
    this.subscriptionMenuToggle.unsubscribe();
    this.subscriptionIsLoggedIn.unsubscribe();
  }
}
