import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AccountDataContext, AccountUserData, AccountActionControl, AccountManager } from 'thingshub-js-sdk';
import { endPointAddress } from './utils';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private accountManager: AccountManager;

  private userId: string = null;

  public isLoggedIn$: Subject<AccountUserData> = new Subject<AccountUserData>();

  private actionControl: AccountActionControl = {
    getSecurityHeader : () => {
      return this.getSecurityHeader();
    },
    refreshToken: (): Promise<any> => {

      // Shows login Component
      this.isLoggedIn$.next(null);
      return new Promise((resolve, reject) => {
        const subscription = this.isLoggedIn$.subscribe((accountUserData: AccountUserData) => {
          subscription.unsubscribe();
          if (accountUserData != null) {
            resolve(accountUserData);
            return accountUserData;
          }
          // With accountUserData == null assert UserId changed without appropriate logout
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

  public getSecurityHeader = () => {
    return { Authorization: 'Bearer ' + this.accountManager.accessToken};
  }
  public getSecurityToken = () => {
    return 'token=' + this.accountManager.accessToken;
  }

  constructor() {
    this.accountManager = new AccountManager('thingshub',
      new AccountDataContext(endPointAddress, this.actionControl));
  }

  public get remember(): boolean {
    return this.accountManager.remember;
  }

  public async login(username: string, password: string, remember: boolean): Promise<AccountUserData> {
    const loginData: AccountUserData = await this.accountManager.login(username, password, remember);
    if (!this.userId) {
      this.userId = loginData.id;
    }
    // The user is changed without appropriate logout
    if (this.userId !== loginData.id) {
      this.userId = null;
      this.accountManager.resetLoginData();
      this.isLoggedIn$.next(null);
      throw new Error('User is changed without appropriate logout action');
    }
    this.isLoggedIn$.next(loginData);
    return loginData;
  }
  public async logout() {
    try {
      await this.accountManager.logout();
    } catch (e) {
      throw(e);
    } finally {
      this.userId = null;
      this.accountManager.resetLoginData();
      this.isLoggedIn$.next(null);
    }
  }
}
