import * as qs from "qs"
import axios, { AxiosRequestConfig, AxiosPromise } from "axios";
import {HttpFailResult, Helpers} from "./helpers";
import {EndPointAddress} from "./endPointAddress";

export class AccountDataContext {

    private securityHeaderHook: () => object = null;

    private accountUrl:string = "";

    constructor(endPointAddress: EndPointAddress, securityHeaderHook: () => object) {
        this.accountUrl = endPointAddress.api + "/account";

        this.securityHeaderHook = securityHeaderHook;
    }

    public login(username: string, password: string) : Promise<any | HttpFailResult> {
        let loginData = {
            username,
            password
        };
        return axios.post(this.accountUrl + "/login",qs.stringify(loginData), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then(function(response) : any {
            return response.data;
        });
    }
    public logout() : Promise<any | HttpFailResult> {
        return axios.post(this.accountUrl + "/logout", null, {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : any {
            return response.data;
        });
    }
}
