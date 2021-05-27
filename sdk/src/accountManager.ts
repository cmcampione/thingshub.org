import jwtDecode from "jwt-decode";
import { EndPointAddress } from "src";
import {AccountActionControl, AccountDataContext, AccountUserData} from "./accountDataContext";

export class AccountManager {

    private accountDataContext: AccountDataContext;

    private _appName: string | null = null;

    private _accessToken:string | null =  null;

    private _userId: string | null =  null;
    private _userName: string | null =  null;

    private deltaTime: number = 0;
    
    //Info: By design ApiKey is never persistent
    private _apiKey : string | null =  null;

    private defaultAccountActionControl: AccountActionControl = {
        isLoggedIn:             () => this.getSecurityHeader() !== null,
        isAccessTokenExpired:   () => this.isAccessTokenExpired,
        getSecurityHeader:      () => this.getSecurityHeader(),
        refreshToken:           () => Promise.reject(),
        resetApp:               () => console.log('resetApp')
    };

    // Info: Doesn't reset apiKey (By design ApiKey is never persistent)
    // Info: It's public because can happen a successful login but not useful for the client's logic,
    //       so the client has the need to clean up login data
    public resetLoginData() : void {

        this._accessToken = null;

        this._userId = null;
        this._userName = null;

        // Useful for node app
        if(typeof localStorage === 'undefined')
            return;

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
    // Info: Reset apiKey (By design ApiKey is never persistent)
    private setLoginData(accountUserData: AccountUserData, remember: boolean) : void {
        
        this._apiKey = null;

        this._accessToken = accountUserData.accessToken;

        this._userId = accountUserData.id;
        this._userName = accountUserData.name;

        this.deltaTime = Math.floor(Date.now()/1000) - accountUserData.iat;

        // Useful for node app
        if(typeof localStorage === 'undefined')
            return;

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
            // Info: By design ApiKey is never persistent
            this._apiKey = apiKey;
            return;
        }

        // Useful for node app
        if(typeof localStorage === 'undefined')
            return;

        this._apiKey = null;

        this._accessToken = sessionStorage.getItem(this._appName + "_AccessToken");

        this._userId = sessionStorage.getItem(this._appName + "_UserId");
        
        this._userName = sessionStorage.getItem(this._appName + "_Username");

        let deltaTime = sessionStorage.getItem(this._appName + "_DeltaTime");
        this.deltaTime = deltaTime ? parseInt(deltaTime) : 0;

        if (this.remember == false)
            return;

        // Info: In localStorage data should be the same of sessionStorage

        this._accessToken = localStorage.getItem(this._appName + "_AccessToken");

        this._userId = localStorage.getItem(this._appName + "_UserId");
        this._userName = localStorage.getItem(this._appName + "_Username");

        deltaTime = localStorage.getItem(this._appName + "_DeltaTime");
        this.deltaTime = deltaTime ? parseInt(deltaTime) : 0;
    }

    constructor(appName: string, endPointAddress: EndPointAddress, apiKey?: string, accountActionControl?: AccountActionControl) {

        this._appName = appName;
        let aAc = accountActionControl ? accountActionControl : this.defaultAccountActionControl;
        this.accountDataContext =  new AccountDataContext(endPointAddress, aAc);
        
        this.getLoginData(apiKey);

        if (this.apiKey)
            return;

        if (!this.accessToken)
            return;

        if (this.isAccessTokenExpired) {
            this.resetLoginData();
        }
    }       

    public get apiKey() : string | null {
        return this._apiKey;
    }
    public get accessToken() : string | null {
        return this._accessToken;
    }

    public getSecurityHeader = () : object | null => {
        if (this.apiKey)
            return { thapikey: this.apiKey }
        if (this.accessToken)
            return { Authorization: "Bearer " + this.accessToken}
        return null;
    }
    public getSecurityToken = () : string | null => { 
        if (this.apiKey)
            return "token=" + this.apiKey;
        if (this.accessToken)
            return "token=" + this.accessToken;
        return null;
    }

    public get isAccessTokenExpired() : boolean {
        if (this.apiKey)
            return false; // ApiKey never exipire
        // Sanity check
        if (!this.accessToken)
            return true;

        const accountUserDataRaw: any = jwtDecode(this.accessToken);
        return (accountUserDataRaw.exp + this.deltaTime < Math.floor(Date.now()/1000));
    }
    public get isLoggedIn() : boolean {
        if (this.apiKey)
            return true;

        if (!this.accessToken)
            return false;

        return !this.isAccessTokenExpired;
    }

    public get remember() : boolean {
        // Useful for node app
        if(typeof localStorage === 'undefined')
            return false;
        return localStorage.getItem(this._appName + "_Remember") == "true" ? true : false;
    }
    
    public async login(username: string, password: string, remember: boolean) : Promise<AccountUserData> {

        this._apiKey =  null;// resetLoginData does Not reset api Key
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
        catch(e) {
            throw(e);
        }
        finally {
            this._apiKey = null;// Sanity check
            this.resetLoginData();
        }
    }
}
