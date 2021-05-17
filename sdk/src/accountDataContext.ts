import * as qs from "qs"
import axios from "axios";
import jwtDecode from "jwt-decode";
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

    constructor(endPointAddress: EndPointAddress, private accountActionControl?: AccountActionControl) {

        this.accountUrl = endPointAddress.api + "/account";

        axios.interceptors.response.use(response => response,
            async err => {
                const error = err.response;
                if (accountActionControl && error &&
                    error.status === 401 && error.config &&
                    !error.config.__isRetryRequest) {
                    try {
                        const response = await this.accountActionControl.refreshToken();
                        // ToDo: I don't know if this is useful only for "login refresh token", I have to test with real refresh token http call
                        error.config.__isRetryRequest = true;
                        // set new access token after refresh it
                        error.config.headers = { ...error.config.headers, ...this.accountActionControl.getSecurityHeader()};
                        return axios(error.config);
                    }
                    catch (e) {
                        // refreshing has failed => redirect to login
                        // clear cookie (with logout action) and return to identityserver to new login
                        // (window as any).location = "/account/logout";
                        // ToDo: Can be called many times
                        this.accountActionControl.resetApp();
                        return Promise.reject(e);
                    }
                }
                return Promise.reject(err);
            }
        );
    }

    /* 
    async function foo() {
        return 1
    }

    ...is similar to:

    function foo() {
        return Promise.resolve(1)
    }
    */
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
    // ToDo: To check
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
        const response = await axios.get(this.accountUrl + "/logout", {
            headers: this.accountActionControl ? this.accountActionControl.getSecurityHeader() : null
        });
        return response.data;
    }
}
