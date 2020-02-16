import { Component, ViewChild, OnDestroy } from '@angular/core';
import { SidePageComponent } from './side-page/side-page.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { MenuService } from './menu.service';
import { AccountService } from './account.service';
import { AccountUserData } from 'thingshub-js-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

  public sidePage    = SidePageComponent;
  public contentPage = ContentPageComponent;

  @ViewChild('splitter', {static: false}) splitter;

  public isLoggedIn: boolean = false;
  private readonly checkLogin = (accountUserData: AccountUserData) => {
    this.isLoggedIn = accountUserData != null;
  };
  
  constructor(private accountService: AccountService, private menuService: MenuService) {
    this.accountService.isLoggedIn.subscribe(this.checkLogin);
    this.menuService.toggle.subscribe(() => this.splitter.nativeElement.side.open());
  }

  ngOnDestroy() {    
  }
}
