import { Injectable } from '@angular/core';
import * as thingshub from 'thingshub-js-sdk';
import { endPointAddress } from "./utils";

let accountManager: thingshub.AccountManager = null;

export function securityHeaderHook() {
  return { Authorization: "Bearer " + accountManager.accessToken};
}

const accountDataContext = new thingshub.AccountDataContext(endPointAddress, securityHeaderHook);
accountManager = new thingshub.AccountManager("thingshub", accountDataContext);

@Injectable()
export class AccountService {

  constructor() { 

  }

  public get isLoggedIn() : boolean {
    return accountManager.isLoggedIn;
  }

  public async login(username, password, remember) : Promise<any> {
    
    return await accountManager.login(username, password,, remember);
    
  }

}
