export interface ItemsRange {
    skip: number;
    top: number;
    totalItems: number;
}
export declare class HttpRequestCanceler {
    cancelerToken: any;
    executor: any;
    setup(): void;
    reset(): void;
    cancel(): void;
}
export declare type HttpFailResult = any;
export declare class Helpers {
    static readonly securityHeaders: any;
    static getRangeItemsFromResponse(response: any): ItemsRange;
}
