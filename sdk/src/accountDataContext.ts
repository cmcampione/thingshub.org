import * as qs from "qs"
import axios, { AxiosHeaders } from "axios";
import jwtDecode from "jwt-decode";
import {EndPointAddress} from "./endPointAddress";

export interface AccountUserData {
    accessToken: string;
    id: string;
    name: string;
    exp: number,
    iat: number
}
export interface AccountActionControl {
    isLoggedIn:             () => boolean;
    isAccessTokenExpired:   () => boolean; 
    getSecurityHeader:      () => object | null;
    refreshToken:           () => Promise<any>;
    resetApp:               () => void;
}

export class AccountDataContext {

    private accountUrl:string = "";

    constructor(endPointAddress: EndPointAddress, accountActionControl: AccountActionControl) {

        this.accountUrl = endPointAddress.api + "/account";

        axios.interceptors.request.use(async config => {
            if (!accountActionControl) // Sanity check
                return config;
            
            // Useful for http calls, like login, without authentication
            if (!accountActionControl.isLoggedIn())
                return config;

            if (!accountActionControl.isAccessTokenExpired())
            {
                config.headers = { ...config.headers, ...accountActionControl.getSecurityHeader()} as AxiosHeaders;
                return config;
            }

            try {
                await accountActionControl.refreshToken();               
                config.headers = { ...config.headers, ...accountActionControl.getSecurityHeader()} as AxiosHeaders;
                return config;
            }
            catch (e) {
                accountActionControl.resetApp();
                throw e;
            }
        }, function (error) {
            return Promise.reject(error);
        });
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
        const loginData = {
            username,
            password
        };
        const config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        };
        const response = await axios.post(this.accountUrl + "/login", qs.stringify(loginData), config);
        const accountUserDataRaw: any = jwtDecode(response.data.access_token);
        return {
            accessToken: response.data.access_token,
            id: accountUserDataRaw.sub,
            name: accountUserDataRaw.name,
            exp: accountUserDataRaw.exp,
            iat: accountUserDataRaw.iat
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
        const response = await axios.get(this.accountUrl + "/logout");
        return response.data;
    }
}
