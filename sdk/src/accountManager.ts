import axios from "axios";
import * as jwtDecode from "jwt-decode";
import {AccountDataContext, AccountUserData} from "./accountDataContext";

export class AccountManager {

    private dummy8: string = "carmelo";

    private accountDataContext: AccountDataContext;

    private _appName: string = null;    

    private _accessToken:string = null;

    private _userId: string = null;
    private _userName: string = null;

    private deltaTime: number = null;
    
    //INFO: apiKey is never persistent
    private _apiKey : string = null;

    //TODO: Why is public?
    public resetLoginData() : void {

        this._accessToken = null;

        this._userId = null;
        this._userName = null;

        localStorage.removeItem(this._appName + "_Remember");

        localStorage.removeItem(this._appName + "_AccessToken");
        sessionStorage.removeItem(this._appName + "_AccessToken");

        localStorage.removeItem(this._appName + "_DeltaTime");
        sessionStorage.removeItem(this._appName + "_DeltaTime");

        localStorage.removeItem(this._appName + "_UserId");
        sessionStorage.removeItem(this._appName + "_UserId");
        localStorage.removeItem(this._appName + "_Username");
        sessionStorage.removeItem(this._appName + "_Username");
    }
    private setLoginData(accountUserData: AccountUserData, remember: boolean) : void {
        
        this._apiKey = null;

        this._accessToken = accountUserData.accessToken;

        this._userId = accountUserData.id;
        this._userName = accountUserData.name;

        this.deltaTime = 0;

        sessionStorage.setItem(this._appName + "_AccessToken", this._accessToken);

        sessionStorage.setItem(this._appName + "_UserId", this._userId);
        sessionStorage.setItem(this._appName + "_Username", this._userName);

        sessionStorage.setItem(this._appName + "_DeltaTime", this.deltaTime.toString());

        localStorage.setItem(this._appName + "_Remember", remember == true ? "true" : "false");

        if (remember == false)
            return

        localStorage.setItem(this._appName + "_AccessToken", this._accessToken);

        localStorage.setItem(this._appName + "_UserId", this._userId);
        localStorage.setItem(this._appName + "_Username", this._userName);

        localStorage.setItem(this._appName + "_DeltaTime", this.deltaTime.toString());
    }
    private getLoginData(apiKey?: string): void {

        if (apiKey) {
            // Sanity check
            this.resetLoginData();
            // INFO: By design ApiKey is never persistent
            this._apiKey = apiKey;
            return;
        }

        this._apiKey = null;

        this._accessToken = sessionStorage.getItem(this._appName + "_AccessToken");

        this._userId = sessionStorage.getItem(this._appName + "_UserId");
        this._userName = sessionStorage.getItem(this._appName + "_Username");

        this.deltaTime = parseInt(sessionStorage.getItem(this._appName + "_DeltaTime"));

        if (this.remember == false)
            return;

        this._accessToken = localStorage.getItem(this._appName + "_AccessToken");

        this._userId = localStorage.getItem(this._appName + "_UserId");
        this._userName = localStorage.getItem(this._appName + "_Username");

        this.deltaTime = parseInt(localStorage.getItem(this._appName + "_DeltaTime"));
    }

    constructor(appName: string, accountDataContext: AccountDataContext, apiKey?: string) {

        this._appName = appName;
        this.accountDataContext = accountDataContext;

        this.getLoginData(apiKey);

        if (this.apiKey)
            return;

        if (!this.accessToken)
            return;

        const accountUserDataRaw: any = jwtDecode(this.accessToken);

        let dateNow = new Date();
        if (accountUserDataRaw.exp < Math.trunc(dateNow.getTime()/1000)) {
            this.resetLoginData();
        }
    }       

    public get apiKey() : string {
        return this._apiKey;
    }
    public get accessToken() : string {
        return this._accessToken;
    }

    public getSecurityHeader = (): object => {
        return this.apiKey ? { thapikey: this.apiKey } : { Authorization: "Bearer " + this.accessToken} ;
    }
    public getSecurityToken = (): string => {
        return this.apiKey ? "token=" + this.apiKey : "token=" + this.accessToken;
    }

    public get isLoggedIn() : boolean {
        if (this.apiKey)
            return true;

        if (!this.accessToken)
            return false;

        const accountUserDataRaw: any = jwtDecode(this.accessToken);

        let dateNow = new Date();
        let dateNowN = Math.floor(dateNow.getTime()/1000);
        if (accountUserDataRaw.exp < Math.floor(dateNow.getTime()/1000))
            return false;
        return true;
    }

    public get remember() : boolean {
        return localStorage.getItem(this._appName + "_Remember") == "true" ? true : false;
    }
    public async login(username: string, password: string, remember: boolean) : Promise<AccountUserData> {

        this._apiKey =  null;
        this.resetLoginData();

        const accountUserData: AccountUserData = await this.accountDataContext.login({ username, password });

        this.setLoginData(accountUserData, remember);
        return accountUserData;
    }  
    public async logout() : Promise<any> {
        try
        {
            return await this.accountDataContext.logout();
        }
        finally {
            this._apiKey = null;
            this.resetLoginData();
        }
    }
}
