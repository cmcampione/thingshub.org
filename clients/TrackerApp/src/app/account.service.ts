import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AccountDataContext, AccountUserData, AccountActionControl, AccountManager } from 'thingshub-js-sdk';
import { endPointAddress } from './utils';

@Injectable()
export class AccountService {

  private accountDataContext: AccountDataContext;
  private accountManager: AccountManager;

  private userId: string = null;

  private _isLoggedIn: Subject<AccountUserData> = new Subject<AccountUserData>();
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  private actionControl: AccountActionControl = {
    getSecurityHeader : () => {
      return { Authorization: 'Bearer ' + this.accountManager.accessToken};
    },
    refreshToken: (): Promise<any> => {

      // Show login Component
      this._isLoggedIn.next(null);
      return new Promise((resolve, reject) => {
        const subscription = this.isLoggedIn$.subscribe((accountUserData: AccountUserData) => {
          subscription.unsubscribe();
          if (accountUserData != null) {
            resolve(accountUserData);
            return accountUserData;
          }
          // With accountUserData == null assert UserId changed without properly logout
          const err = new Error('User is changed without appropriate logout action');
          reject(err);
          return err;
        });
      });
    },
    resetApp: () => {
      console.log('resetApp');
    }
  };

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
    // The user is changed without properly logout
    if (this.userId !== loginData.id) {
      this.userId = null;
      this.accountManager.resetLoginData();
      this._isLoggedIn.next(null);
      throw new Error('User is changed without appropriate logout action');
    }
    this._isLoggedIn.next(loginData);
    return loginData;
  }
}
