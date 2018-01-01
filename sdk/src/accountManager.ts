import {HttpFailResult} from "./helpers";
import {AccountDataContext} from "./accountDataContext";
import axios from "axios";

export class AccountManager {

    private accountDataContext: AccountDataContext;
    
    private _appName: string = null;    

    private _accessToken:string = null;

    private _userId: string = null;
    private _userName: string = null;
    
    //INFO: apiKey is never persistent
    private _apiKey : string = null;

    private resetLoginData() : void {
        
        this._apiKey = null;

        this._accessToken = null;

        this._userId = null;
        this._userName = null;

        localStorage.removeItem(this._appName + "_Remember");

        localStorage.removeItem(this._appName + "_AccessToken");
        sessionStorage.removeItem(this._appName + "_AccessToken");        

        localStorage.removeItem(this._appName + "_UserId");
        sessionStorage.removeItem(this._appName + "_UserId");
        localStorage.removeItem(this._appName + "_Username");
        sessionStorage.removeItem(this._appName + "_Username");
    }
    private setLoginData(loginData: any, remember: boolean) : void {
        
        this._apiKey = null;

        this._accessToken = loginData.access_token;

        this._userId = loginData.userId;
        this._userName = loginData.userName;

        sessionStorage.setItem(this._appName + "_AccessToken", this._accessToken);

        sessionStorage.setItem(this._appName + "_UserId", this._userId);
        sessionStorage.setItem(this._appName + "_Username", this._userName);

        localStorage.setItem(this._appName + "_Remember", remember == true ? "true" : "false");

        if (remember == false)
            return

        localStorage.setItem(this._appName + "_AccessToken", this._accessToken);

        localStorage.setItem(this._appName + "_UserId", this._userId);
        localStorage.setItem(this._appName + "_Username", this._userName);
    }
    private readLoginData() {

        // INFO: By design ApiKey is never persistent
        this._apiKey = null;

        this._accessToken = sessionStorage.getItem(this._appName + "_AccessToken");

        this._userId = sessionStorage.getItem(this._appName + "_UserId");
        this._userName = sessionStorage.getItem(this._appName + "_Username");

        let remember = localStorage.getItem(this._appName + "_Remember") == "true" ? true : false;
        if (remember == false)
            return;

        this._accessToken = localStorage.getItem(this._appName + "_AccessToken");

        this._userId = localStorage.getItem(this._appName + "_UserId");
        this._userName = localStorage.getItem(this._appName + "_Username");
    }

    constructor(appName: string, accountDataContext: AccountDataContext) {

        this._appName = appName;
        this.accountDataContext = accountDataContext;
        this.readLoginData();
    }       

    public get apiKey() : string {
        return this._apiKey;
    }
    public get accessToken() : string {
        return this._accessToken;
    }

    public get isLoggedIn() : boolean {
        return (this._apiKey != null) || (this.accessToken != null);
    }

    public set apiKey(value: string) {

        // I do not know if I used the loginData before, so I reset LoginData
        this.resetLoginData();

        this._apiKey = value;
    }

    public async login(username: string, password: string, remember: boolean) : Promise<any> {

        let response = await this.accountDataContext.login(username, password);
        this.setLoginData(response, remember);
        return response;
    }  
    public async logout() : Promise<any> {
        try
        {
            return await this.accountDataContext.logout();
        }
        finally {
            this.resetLoginData();
        }
    }
}