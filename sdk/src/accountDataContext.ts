import * as qs from "qs"
import axios, { AxiosRequestConfig, AxiosPromise } from "axios";
import {HttpFailResult, Helpers} from "./helpers";
import {EndPointAddress} from "./endPointAddress";

export interface LoginData {
        username : string;
        password : string;
}

export class AccountDataContext {

    private securityHeaderHook: () => object = null;

    private accountUrl:string = "";

    constructor(endPointAddress: EndPointAddress, securityHeaderHook: () => object) {
        this.accountUrl = endPointAddress.api + "/account";

        this.securityHeaderHook = securityHeaderHook;
    }

    public login(loginData: LoginData) : Promise<any | HttpFailResult> {
        return axios.post(this.accountUrl,qs.stringify(loginData), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(function(response) : any {
            return response.data;
        });
    }
    public logout() : Promise<any | HttpFailResult> {
        return axios.post(this.accountUrl, null, {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : any {
            return response.data;
        });
    }
}
