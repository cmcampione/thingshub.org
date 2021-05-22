import jwtDecode from "jwt-decode";
import {AccountDataContext, AccountUserData} from "./accountDataContext";

export class AccountManager {

    private accountDataContext: AccountDataContext;

    private _appName: string = null;    

    private _accessToken:string = null;

    private _userId: string = null;
    private _userName: string = null;

    private deltaTime: number = null;
    
    //Info: By design ApiKey is never persistent
    private _apiKey : string = null;

    // Info: Don't reset apiKey (By design ApiKey is never persistent)
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

        this.deltaTime = parseInt(sessionStorage.getItem(this._appName + "_DeltaTime"));

        if (this.remember == false)
            return;

        // Info: In localStorage data should be the same of sessionStorage

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
        if (accountUserDataRaw.exp + this.deltaTime < Math.floor(Date.now()/1000)) {
            this.resetLoginData();
        }
    }       

    public get apiKey() : string {
        return this._apiKey;
    }
    public get accessToken() : string {
        return this._accessToken;
    }

    public getSecurityHeader = (): object => this.apiKey ? { thapikey: this.apiKey } : { Authorization: "Bearer " + this.accessToken} ;    
    public getSecurityToken = (): string => this.apiKey ? "token=" + this.apiKey : "token=" + this.accessToken;

    public get isLoggedIn() : boolean {
        if (this.apiKey)
            return true;

        if (!this.accessToken)
            return false;

        const accountUserDataRaw: any = jwtDecode(this.accessToken);
        return (accountUserDataRaw.exp + this.deltaTime >= Math.floor(Date.now()/1000));
    }

    public get remember() : boolean {
        // Useful for node app
        if(typeof localStorage === 'undefined')
            return false;
        return localStorage.getItem(this._appName + "_Remember") == "true" ? true : false;
    }
    public async login(username: string, password: string, remember: boolean) : Promise<AccountUserData> {

        this._apiKey =  null;
        this.resetLoginData();// Does'nt reset apiKey

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
