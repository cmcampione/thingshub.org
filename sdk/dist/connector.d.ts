export declare const enum ConnectionState {
    Connecting = 0,
    Connected = 1,
    Reconnecting = 2,
    Disconnected = 4,
}
export interface StateChanged {
    oldState: ConnectionState;
    newState: ConnectionState;
}
export declare class Connector {
    private authHook;
    private stateChangedHook;
    private reconnectedHook;
    private subscribeSuccessHook;
    private subscribeFailHook;
    subscribe(): void;
    unsubscribe(): void;
    setHook(eventName: string, hook: (...msg: any[]) => void): void;
    remHook(eventName: any, hook: (...msg: any[]) => void): void;
    constructor(url: string, authHook: () => void, stateChangedHook: (change: StateChanged) => void, reconnectedHook: () => void, subscribeSuccessHook: () => void, subscribeFailHook: () => void);
}
export declare class SocketIOConnector extends Connector {
    private socket;
    constructor(url: string, authHook: () => void, stateChangedHook: (change: StateChanged) => void, reconnectedHook: () => void, subscribeSuccessHook: () => void, subscribeFailHook: () => void);
}
