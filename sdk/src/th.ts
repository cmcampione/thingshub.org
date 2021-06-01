import { AccountManager } from "./accountManager"
import { ThingsDataContext } from "./thingsDataContext"
import { SocketIORealtimeConnector } from "./realtimeConnectors"
import { EndPointAddress } from "./endPointAddress"
import { Thing } from "./thing"
import { ThingUserChangeClaims, ThingUserReadClaims } from "../../common/src/thConstants"
import { ThingClaims, ThingsManager } from "./thingsManager"
import { HttpRequestCanceler } from "./helpers"

class thingsHub {
    private endPointAddress:EndPointAddress = {
        server: "https://api.thingshub.org:3000",
        api: "https://api.thingshub.org:3000/api"
    }
    private accountManager: AccountManager
    private thingsDatacontext: ThingsDataContext
    private realTimeConnector: SocketIORealtimeConnector
    private thingsManager: ThingsManager
    private thingsManagerClaims: ThingClaims = {

        publicReadClaims : ThingUserReadClaims.NoClaims,
        publicChangeClaims: ThingUserChangeClaims.NoClaims,

        everyoneReadClaims: ThingUserReadClaims.NoClaims,
        everyoneChangeClaims: ThingUserChangeClaims.NoClaims,

        creatorUserReadClaims: ThingUserReadClaims.AllClaims,
        creatorUserChangeClaims: ThingUserChangeClaims.AllClaims
    }

    private onError = (error: any) => console.log(error)
    private onConnectError = (error: any) => console.log(error)
    private onStateChanged = (change: any) => console.log(change)

    public mainThing: Thing
    public httpRequestCanceler: HttpRequestCanceler

    constructor(address: string, apiKey: string) {
        this.endPointAddress.server = address + ":3000"
        this.endPointAddress.api = address + ":3000/api"

        this.accountManager = new AccountManager("thingshub", this.endPointAddress, apiKey)
        
        this.realTimeConnector = new SocketIORealtimeConnector(this.endPointAddress.server, 
            this.accountManager.getSecurityToken, this.onError, this.onConnectError, this.onStateChanged)
        this.realTimeConnector.subscribe(); // There is an automatic reconnection

        this.mainThing = new Thing();
        this.thingsDatacontext = new ThingsDataContext(this.endPointAddress)
        this.thingsManager = new ThingsManager(this.mainThing, "first thing", 
            this.thingsManagerClaims, this.thingsDatacontext, this.realTimeConnector)

        this.httpRequestCanceler = new HttpRequestCanceler()
    }

    public on(eventName : string, hook : (...msg: any[]) => void) {
        this.realTimeConnector.setHook(eventName, hook)
        return this
    }
    public get() {
        this.thingsManager.getMoreThings(this.httpRequestCanceler).then()
        return this
    }
}

export const th = (address: string, apiKey: string): thingsHub => new thingsHub(address, apiKey) 
