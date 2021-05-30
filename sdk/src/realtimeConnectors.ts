import axios from "axios";
import { io, Socket } from 'socket.io-client';

export const enum RealtimeConnectionStates {
    Connecting = 0,
    Connected = 1,
    Reconnecting = 2,
    Disconnected = 4
}
export class RealtimeConnector {

    protected connectionStatus : RealtimeConnectionStates = RealtimeConnectionStates.Disconnected;

    protected url: string = "";//   https://servername:port/route
    
    protected authHook: null | (() => string) = null;

    protected errorHook: null | ((error: any) => void) = null;
    protected stateChangedHook: null | ((newState: RealtimeConnectionStates) => void) = null;
    protected connectErrorHook: null | ((error: any) => void) = null;

    protected on_connectionStatusChange(newState : RealtimeConnectionStates) {
        if (this.connectionStatus == newState)
            return;
        
        this.connectionStatus = newState;
        if (this.stateChangedHook)
            this.stateChangedHook(newState);
    }

    public subscribe() : void {}
    public unsubscribe() : void {}

    public setHook(_eventName : string, _hook : (...msg: any[]) => void) : void {}
    public remHook(_eventName : any, _hook : (...msg: any[]) => void) : void {}

    constructor(url : string,
        authHook : () => string,
        errorHook : (error: any) => void,
        connectErrorHook : (error: any) => void,
        stateChangedHook : (change: RealtimeConnectionStates) => void) {
            this.url = url;

            this.authHook = authHook;
            
            this.errorHook = errorHook;
            this.connectErrorHook = connectErrorHook;
            this.stateChangedHook = stateChangedHook;
    }

    // Only for test purpose
    public async api() : Promise<any | any> {
        const response = await axios.get(this.url + "/api");
        return response;
    }
}

export class SocketIORealtimeConnector extends RealtimeConnector {
    
    private socket : Socket | null = null;
    
    constructor(url : string,
        authHook : () => string,
        errorHook : (error: any) => void,
        connectErrorHook : (error: any) => void,
        stateChangedHook : (change: RealtimeConnectionStates) => void) {
            super(url, authHook, errorHook, connectErrorHook, stateChangedHook);
    }

    private on_error(error: any) {
        if (this.errorHook)
            this.errorHook(error);
    }
    private on_connect_error(error: any) {
        if (this.connectErrorHook)
            this.connectErrorHook(error);
    }

    private on_connect() {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(RealtimeConnectionStates.Connected);
    }
    private on_disconnect(_reason: any) {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(RealtimeConnectionStates.Disconnected);         
    }

    public subscribe() : void {
        if (this.socket)
            return;

        let fullUrl = this.url;
        if (this.authHook)
            fullUrl += "?" + this.authHook();

        // ToDo: Add support for options of socketio
        this.socket = io(fullUrl);

        this.socket.on("error", (error: any) => this.on_error(error));

        this.socket.on("connect_error", (error: any) => this.on_connect_error(error));
        this.socket.on("connect", () => this.on_connect());
        this.socket.on("disconnect", (reason: any) => this.on_disconnect(reason));
    }
    public unsubscribe() : void {
        if (!this.socket)
            return;
        
        // The socket.io source, the socket object (which is the EventEmitter) is deleted
        // when the client disconnects so it is not necessary to manually call removeAllListeners.
        this.socket.disconnect();
        this.socket = null;
    }

    public setHook(eventName : string, hook : (...msg: any[]) => void) : void {
        if (this.socket)
            this.socket.on(eventName, hook);
    }
    public remHook(eventName : any, hook : (...msg: any[]) => void) : void {
        // Could happen after unsubscribe, so this.socket is null
        // The socket.io source, the socket object (which is the EventEmitter) is deleted
        // when the client disconnects so it is not necessary to manually call removeAllListeners.
        if (!this.socket)
            return;
        this.socket.off(eventName, hook);
    }
}