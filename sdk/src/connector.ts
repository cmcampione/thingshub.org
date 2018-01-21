import axios, { AxiosRequestConfig, AxiosPromise } from "axios";
import * as socketIo from "socket.io-client";

export const enum ConnectionStates {
    Connecting = 0,
    Connected = 1,
    Reconnecting = 2,
    Disconnected = 4
}

export class Connector {

    protected connectionStatus : ConnectionStates = ConnectionStates.Disconnected;

    protected url: string = "";//   https://servername:port/route
    
    protected authHook: () => void = null;

    protected errorHook: (error: any) => void = null;
    protected stateChangedHook: (newState: ConnectionStates) => void = null;
    protected connectErrorHook: (error: any) => void = null;

    protected on_connectionStatusChange(newState : ConnectionStates) {
        if (this.connectionStatus == newState)
            return;
        
        this.connectionStatus = newState;
        this.stateChangedHook(newState);
    }

    public subscribe() : void {}
    public unsubscribe() : void {}

    public setHook(eventName : string, hook : (...msg: any[]) => void) : void {}
    public remHook(eventName : any, hook : (...msg: any[]) => void) : void {}

    constructor(url : string,
        authHook : () => void,
        errorHook : (error) => void,
        connectErrorHook : (error) => void,
        stateChangedHook : (change: ConnectionStates) => void) {

            this.url = url;

            this.authHook = authHook;
            
            this.errorHook = errorHook;
            this.connectErrorHook = connectErrorHook;
            this.stateChangedHook = stateChangedHook;
    }

    public api() : Promise<any | any> {
        return axios.get(this.url + "/api")
        .then((response : any) => {return response; });
    }
}

export class SocketIOConnector extends Connector {
    
    private socket : SocketIOClient.Socket = null;
    
    constructor(url : string,
        authHook : () => void,
        errorHook : (error) => void,
        connectErrorHook : (error) => void,
        stateChangedHook : (change: ConnectionStates) => void) {
            super(url, authHook, errorHook, connectErrorHook, stateChangedHook);
    }

    private on_error(error) {
        if (this.errorHook)
            this.errorHook(error);
    }
    private on_connect_error(error) {
        if (this.connectErrorHook)
            this.connectErrorHook(error);
    }

    private on_connect() {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(ConnectionStates.Connected);
    }
    private on_disconnect(reason) {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(ConnectionStates.Disconnected);
    }

    public subscribe() : void {
        if (this.socket)
            return;

        let fullUrl = this.url + "?" + this.authHook();
        this.socket = socketIo(fullUrl);

        this.socket.on("error", error => this.on_error(error));

        this.socket.on("connect_error", error => this.on_connect_error(error));
        this.socket.on("connect", () => this.on_connect());
        this.socket.on("disconnect", reason => this.on_disconnect(reason));
    }
    public unsubscribe() : void {
        if (!this.socket)
            return;

        this.socket.disconnect();
    }

    public setHook(eventName : string, hook : (...msg: any[]) => void) : void {
        this.socket.on(eventName, hook);
    }
    public remHook(eventName : any, hook : (...msg: any[]) => void) : void {
        this.socket.off(eventName, hook);
    }
}