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

  public isLoggedIn$: Subject<boolean> = new Subject<boolean>();

  private accountActionControl: AccountActionControl = {
    getSecurityHeader : () => this.getSecurityHeader(),
    refreshToken: () : Promise<any> => {
      this.isLoggedIn$.next(false);// Shows login Component
      return new Promise((resolve, reject) => {
        const subscription = this.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
          subscription.unsubscribe();
          if (isLoggedIn) {
            resolve(isLoggedIn);
            return isLoggedIn; // ToDo: I don't know if return accountUserData is necessary after a resolve
          }
          // With accountUserData == false assert UserId changed without appropriate logout
          const err = new Error('User is changed without appropriate logout action');
          reject(err);
          return err;// ToDo: I don't know if return err is necessary after a reject
        });
      });
    },
    resetApp: () => console.log('resetApp')
  };

  // ToDo: This method is public for MapComponent and ThingsServer Access, maybe can not really necessary
  public getSecurityHeader = () => {
    return { Authorization: 'Bearer ' + this.accountManager.accessToken};
  }
  // ToDo: This method is public for RealTimeConnector, maybe can not really necessary
  public getSecurityToken = () => 'token=' + this.accountManager.accessToken;

  constructor() {
    this.accountManager = new AccountManager('thingshub',
      new AccountDataContext(endPointAddress, this.accountActionControl));
  }

  public get isLoggedIn(): boolean {
    return this.accountManager.isLoggedIn;
  }

  public get remember(): boolean {
    return this.accountManager.remember;
  }

  public async login(username: string, password: string, remember: boolean): Promise<AccountUserData> {
    const loginData: AccountUserData = await this.accountManager.login(username, password, remember);
    if (!this.userId) {
      this.userId = loginData.id;
    }
    // The user was changed without appropriate logout action
    if (this.userId !== loginData.id) {
      this.userId = null;
      this.accountManager.resetLoginData();
      this.isLoggedIn$.next(false);
      throw new Error('User was changed without appropriate logout action');
    }
    this.isLoggedIn$.next(true);
    return loginData;
  }
  public async logout() {
    try {
      await this.accountManager.logout();
    } catch (e) {
      throw(e);
    } finally {
      this.userId = null;
      this.accountManager.resetLoginData(); // Sanity check
      this.isLoggedIn$.next(false);
    }
  }
}
