import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AccountDataContext, AccountUserData, AccountActionControl, AccountManager } from 'thingshub-js-sdk';
import { endPointAddress } from './utils';

@Injectable()
export class AccountService {

  public getSecurityHeader = () => {
    return { Authorization: 'Bearer ' + this.accountManager.accessToken};
  }
  private refreshToken = (): Promise<any> => {

    this._isLoggedIn.next(null);

    return new Promise((resolve, reject) => {
      const subscription = this.isLoggedIn$.subscribe((accountUserData: AccountUserData) => {
        subscription.unsubscribe();
        if (accountUserData != null) {
          resolve(accountUserData);
        }
        else {
          reject(accountUserData);
        }
        return accountUserData;
      });
    });
  }

  private actionControl : AccountActionControl = {
    getSecurityHeader : this.getSecurityHeader,
    refreshToken: this.refreshToken,
    resetApp: () => {
      console.log("resetApp");
    }
  };

  private accountDataContext: AccountDataContext;
  private accountManager: AccountManager;

  private userId: string = null;

  private _isLoggedIn: Subject<AccountUserData> = new Subject<AccountUserData>();
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor() {

    this.accountDataContext = new AccountDataContext(endPointAddress, this.actionControl);
    this.accountManager = new AccountManager('thingshub', this.accountDataContext);
  }

  public get isLoggedIn(): boolean {
    return this.accountManager.isLoggedIn;
  }

  public async login(username, password, remember): Promise<AccountUserData> {
    const loginData: AccountUserData = await this.accountManager.login(username, password, remember);
    if (!this.userId) {
      this.userId = loginData.id;
    }
    if (this.userId != loginData.id)
      this._isLoggedIn.next(null);
    else
      this._isLoggedIn.next(loginData);
    return loginData;
  }
}
