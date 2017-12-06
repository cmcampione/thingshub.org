export declare const enum ConnectionStates {
    Connecting = 0,
    Connected = 1,
    Reconnecting = 2,
    Disconnected = 4,
}
export declare class Connector {
    protected connectionStatus: ConnectionStates;
    protected url: string;
    protected authHook: () => void;
    protected errorHook: (error: any) => void;
    protected stateChangedHook: (newState: ConnectionStates) => void;
    protected connectErrorHook: (error: any) => void;
    protected on_connectionStatusChange(newState: ConnectionStates): void;
    subscribe(): void;
    unsubscribe(): void;
    setHook(eventName: string, hook: (...msg: any[]) => void): void;
    remHook(eventName: any, hook: (...msg: any[]) => void): void;
    constructor(url: string, authHook: () => void, errorHook: (error) => void, connectErrorHook: (error) => void, stateChangedHook: (change: ConnectionStates) => void);
    api(): Promise<any | any>;
}
export declare class SocketIOConnector extends Connector {
    private socket;
    constructor(url: string, authHook: () => void, errorHook: (error) => void, connectErrorHook: (error) => void, stateChangedHook: (change: ConnectionStates) => void);
    private on_error(error);
    private on_connect_error(error);
    private on_connect();
    private on_disconnect(reason);
    subscribe(): void;
    unsubscribe(): void;
    setHook(eventName: string, hook: (...msg: any[]) => void): void;
    remHook(eventName: any, hook: (...msg: any[]) => void): void;
}
