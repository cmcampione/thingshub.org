import axios from 'axios';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from './utils';
import { stagger } from '@angular/core/src/animation/dsl';

let accountManager: thingshub.AccountManager = null;

export function securityHeaderHook() {
  return { Authorization: 'Bearer ' + accountManager.accessToken};
}

const accountDataContext = new thingshub.AccountDataContext(endPointAddress, securityHeaderHook);
accountManager = new thingshub.AccountManager('thingshub', accountDataContext);

@Injectable()
export class AccountService {

  private authTokenRequest: Promise<any>;

  public _isLoggedIn: Subject<boolean> = new Subject<boolean>();
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  resetGetAccessTokenRequest() {
    this.authTokenRequest = null;
  }

  refreshToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.isLoggedIn$.subscribe((status: boolean) => {
        if (status) {
          resolve(status);
        } else {
          reject(status);
        }
        return status;
      });
    });
}

  getNewAccessToken() {

    if (!this.authTokenRequest) {
        this.authTokenRequest = this.refreshToken();
        this.authTokenRequest.then(response => {
            this.resetGetAccessTokenRequest();
        }).catch(error => {
            this.resetGetAccessTokenRequest();
        });
    }

    return this.authTokenRequest;
  }

  constructor() {

    axios.interceptors.response.use((response) => {
      return response;
    },
    err => {
        const error = err.response;
        if (error && error.status === 401 && error.config && !error.config.__isRetryRequest) {

          this._isLoggedIn.next(false);

          return this.getNewAccessToken().then(response => {
              error.config.__isRetryRequest = true;

              // set new access token after refreshing it
              error.config.headers = securityHeaderHook();

              return axios(error.config);
          }).catch(e => {

              // refreshing has failed => redirect to login
              // clear cookie (with logout action) and return to identityserver to new login
              // (window as any).location = "/account/logout";

              return Promise.reject(e);
          });
        }

        return Promise.reject(error);
    });
  }

  public get isLoggedIn(): boolean {
    return accountManager.isLoggedIn;
  }

  public async login(username, password, remember): Promise<any> {
    const loginData = await accountManager.login(username, password, remember);
    this._isLoggedIn.next(accountManager.isLoggedIn);
    return loginData;
  }
}
