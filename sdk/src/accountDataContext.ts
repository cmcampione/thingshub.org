import * as qs from "qs"
import axios from "axios";
import * as jwtDecode from "jwt-decode";
import {HttpFailResult, Helpers} from "./helpers";
import {EndPointAddress} from "./endPointAddress";

export interface AccountUserData {
    accessToken: string;
    id: string;
    name: string;
    exp: Date;
}

export interface AccountActionControl {
    getSecurityHeader: () => object;
    refreshToken: () => Promise<any>;
    resetApp: () => void;
}

export class AccountDataContext {

    private accountUrl:string = "";

    private authTokenRequest: Promise<any>;

    constructor(endPointAddress: EndPointAddress, private accountActionControl: AccountActionControl) {

        this.accountUrl = endPointAddress.api + "/account";

        axios.interceptors.response.use((response) => {
            return response;
          },
          err => {
              const error = err.response;
              if (error && error.status === 401 && error.config && !error.config.__isRetryRequest) {
      
                return this.getNewAccessToken().then(response => {
                    error.config.__isRetryRequest = true;
      
                    // set new access token after refreshing it
                    error.config.headers = this.accountActionControl.getSecurityHeader();
      
                    return axios(error.config);
                }).catch(e => {
      
                    // refreshing has failed => redirect to login
                    // clear cookie (with logout action) and return to identityserver to new login
                    // (window as any).location = "/account/logout";

                    this.accountActionControl.resetApp();
      
                    return Promise.reject(e);
                });
              }
      
              return Promise.reject(error);
          });
    }

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

    // TODO: https://docs.google.com/spreadsheets/d/1Ks-K10kmLcHOom7igTkQ8wtRSJ-73i1hftUAE4E9q80/edit#gid=1455384855&range=C4
    public login(username: string, password: string) : Promise<AccountUserData | HttpFailResult> {
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
        return axios.post(this.accountUrl + "/login",qs.stringify(loginData), config)
        .then(function(response) : AccountUserData {

            const accountUserDataRaw: any = jwtDecode(response.data.access_token);

            return {
                accessToken: response.data.access_token,
                id: accountUserDataRaw.sub,
                name: accountUserDataRaw.name,
                exp: accountUserDataRaw.exp
            };
        })
        .catch(function(e) {
            return e;
        });
    }
    // TODO: To check
    public loginBasic(username: string, password: string) : Promise<any | HttpFailResult> {
        return axios.post(this.accountUrl + "/login","grant_type=client_credentials", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + btoa(username + ":" + password)
            }
        })
        .then(function(response) : any {
            return response.data;
        });
    }
    public logout() : Promise<any | HttpFailResult> {
        return axios.post(this.accountUrl + "/logout", null, {
            headers: this.accountActionControl.getSecurityHeader()
        })
        .then(function(response: any) : any {
            return response.data;
        });
    }
}
