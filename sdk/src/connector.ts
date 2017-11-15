import * as socketIo from 'socket.io-client';

export const enum ConnectionState {
    Connecting = 0,
    Connected = 1,
    Reconnecting = 2,
    Disconnected = 4
}

export interface StateChanged {
    oldState: ConnectionState;
    newState: ConnectionState;
}

export class Connector {
    
    private authHook : () => void = null;

    private stateChangedHook        : (change: StateChanged) => void = null;
    private reconnectedHook         : () => void = null;
    private subscribeSuccessHook    : () => void = null;
    private subscribeFailHook       : () => void = null;

    public subscribe() : void {}
    public unsubscribe() : void {}

    public setHook(eventName : string, hook : (...msg: any[]) => void) : void {}
    public remHook(eventName : any, hook : (...msg: any[]) => void) : void {}

    constructor(url : string,
        authHook : () => void,
        stateChangedHook : (change: StateChanged) => void, 
        reconnectedHook : () => void,
        subscribeSuccessHook : () => void, subscribeFailHook : () => void) {

            this.authHook = authHook;
            this.stateChangedHook = stateChangedHook;
            this.reconnectedHook = reconnectedHook;
            this.subscribeSuccessHook = subscribeSuccessHook;
            this.subscribeFailHook = subscribeFailHook;
    }
}

export class SocketIOConnector extends Connector
{
    private socket : SocketIOClient.Socket = null;
    
    constructor(url : string,
        authHook : () => void,
        stateChangedHook : (change: StateChanged) => void, 
        reconnectedHook : () => void,
        subscribeSuccessHook : () => void, subscribeFailHook : () => void) {
            super(url,
                authHook,
                stateChangedHook, 
                reconnectedHook,
                subscribeSuccessHook, subscribeFailHook);
    }
}