import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from './utils';

@Injectable()
export class AccountService {

  public getSecurityHeader = () => {
    return { Authorization: 'Bearer ' + this.accountManager.accessToken};
  }
  private refreshToken = (): Promise<any> => {

    this._isLoggedIn.next(false);

    return new Promise((resolve, reject) => {
      const subscription = this.isLoggedIn$.subscribe((status: boolean) => {
        if (status) {
          subscription.unsubscribe();
          resolve(status);
        }
        return status;
      });
    });
  }

  private actionControl : thingshub.AccountActionControl = {
    getSecurityHeader : this.getSecurityHeader,
    refreshToken: this.refreshToken,
    resetApp: () => {
      console.log("resetApp");
    }
  };

  private accountDataContext: thingshub.AccountDataContext;
  private accountManager: thingshub.AccountManager;

  private _isLoggedIn: Subject<boolean> = new Subject<boolean>();
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor() {

    this.accountDataContext = new thingshub.AccountDataContext(endPointAddress, this.actionControl);
    this.accountManager = new thingshub.AccountManager('thingshub', this.accountDataContext);
    
  }

  public get isLoggedIn(): boolean {
    return this.accountManager.isLoggedIn;
  }

  public async login(username, password, remember): Promise<any> {
    const loginData = await this.accountManager.login(username, password, remember);
    this._isLoggedIn.next(this.accountManager.isLoggedIn);
    return loginData;
  }
}
