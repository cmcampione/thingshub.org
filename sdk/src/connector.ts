import * as socketIo from "socket.io-client";

export const enum ConnectionStates {
    Connecting = 0,
    Connected = 1,
    Reconnecting = 2,
    Disconnected = 4
}

export class Connector {

    protected connectionStatus : ConnectionStates = ConnectionStates.Disconnected;
    
    protected authHook: () => void = null;

    protected url: string = "";

    protected stateChangedHook: (newState: ConnectionStates) => void = null;
    protected subscribeFailHook: () => void = null;

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
        stateChangedHook : (change: ConnectionStates) => void, 
        subscribeFailHook : () => void) {

            this.authHook = authHook;
            this.stateChangedHook = stateChangedHook;
            this.subscribeFailHook = subscribeFailHook;
    }
}

export class SocketIOConnector extends Connector
{
    private socket : SocketIOClient.Socket = null;
    
    constructor(url : string,
        authHook : () => void, 
        stateChangedHook : (change: ConnectionStates) => void, 
        subscribeFailHook : () => void) {
            super(url, authHook, stateChangedHook, subscribeFailHook);
    }

    private on_error(error) {
    }

    private on_connect_error(error) {
        this.subscribeFailHook();
    }
    private on_connect() {
        this.on_connectionStatusChange(ConnectionStates.Connected);
    }

    private on_disconnect(reason) {
        this.on_connectionStatusChange(ConnectionStates.Disconnected);
    }

    public subscribe() : void {
        if (this.socket)
            return;

        let fullUrl = this.url + "?" + this.authHook();
        this.socket = socketIo(this.url);

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
}