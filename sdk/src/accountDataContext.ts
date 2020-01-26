import * as qs from "qs"
import axios from "axios";
import * as jwtDecode from "jwt-decode";
import {EndPointAddress} from "./endPointAddress";

export interface AccountUserData {
    accessToken: string;
    id: string;
    name: string;
    exp: number
}

export interface AccountActionControl {
    getSecurityHeader: () => object;
    refreshToken: () => Promise<any>;
    resetApp: () => void;
}

export class AccountDataContext {

    private accountUrl:string = "";

    private authTokenRequest: Promise<any>;

    private getNewAccessToken() {

        if (!this.authTokenRequest) {
            this.authTokenRequest = this.accountActionControl.refreshToken();
            this.authTokenRequest.then(response => {
              this.authTokenRequest = null;
            }).catch(error => {
              this.authTokenRequest = null;
            });
        }
        return this.authTokenRequest;
    }

    constructor(endPointAddress: EndPointAddress, private accountActionControl?: AccountActionControl) {

        this.accountUrl = endPointAddress.api + "/account";

        axios.interceptors.response.use((response) => {
            return response;
          },
          async err => {
              const error = err.response;
              if (accountActionControl && error && error.status === 401 && error.config && !error.config.__isRetryRequest) {
      
                try {
                      const response = await this.getNewAccessToken();
                      error.config.__isRetryRequest = true;
                      // set new access token after refreshing it
                      error.config.headers = this.accountActionControl.getSecurityHeader();
                      return axios(error.config);
                  }
                  catch (e) {
                      // refreshing has failed => redirect to login
                      // clear cookie (with logout action) and return to identityserver to new login
                      // (window as any).location = "/account/logout";
                      // TODO: Can be called many times - https://docs.google.com/spreadsheets/d/1Ks-K10kmLcHOom7igTkQ8wtRSJ-73i1hftUAE4E9q80/edit#gid=1455384855&range=D7
                      this.accountActionControl.resetApp();
                      return Promise.reject(e);
                  }
              }
      
              return Promise.reject(error);
          });
    }

    // TODO: https://docs.google.com/spreadsheets/d/1Ks-K10kmLcHOom7igTkQ8wtRSJ-73i1hftUAE4E9q80/edit#gid=1455384855&range=C4
    public async login({ username, password }: { username: string; password: string; }) 
        : Promise<AccountUserData> {
        let loginData = {
            username,
            password
        };
        const config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            __isRetryRequest: true
        };
        const response = await axios.post(this.accountUrl + "/login", qs.stringify(loginData), config);
        const accountUserDataRaw: any = jwtDecode(response.data.access_token);
        return {
            accessToken: response.data.access_token,
            id: accountUserDataRaw.sub,
            name: accountUserDataRaw.name,
            exp: accountUserDataRaw.exp
        };
    }
    // TODO: To check
    public async loginBasic({ username, password }: { username: string; password: string; }) : Promise<any> {
        const response = await axios.post(this.accountUrl + "/login", "grant_type=client_credentials", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(username + ":" + password)
            }
        });
        return response.data;
    }
    public async logout() : Promise<any> {
        const response = await axios.post(this.accountUrl + "/logout", null, {
            headers: this.accountActionControl ? this.accountActionControl.getSecurityHeader() : null
        });
        return response.data;
    }
}
