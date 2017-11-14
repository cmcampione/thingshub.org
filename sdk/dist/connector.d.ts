export declare const enum ConnectionState {
    Connecting = 0,
    Connected = 1,
    Reconnecting = 2,
    Disconnected = 4,
}
export interface StateChanged {
    oldState: number;
    newState: number;
}
export interface Connector {
    subscribe(): void;
    unsubscribe(): void;
    setHook(eventName: string, hook: (...msg: any[]) => void): void;
    remHook(eventName: any, hook: (...msg: any[]) => void): void;
}
export declare class Dummy {
    dummy(): ConnectionState;
}
