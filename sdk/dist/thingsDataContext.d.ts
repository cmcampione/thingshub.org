import { HttpRequestCanceler, HttpFailResult, ItemsRange } from "./helpers";
import { EndPointAddress } from "./endPointAddress";
import { ThingDTO } from "../../common/src/dtos";
import { ThingPositionRaw } from "./thingPosition";
export interface ThingsGetParams {
    parentThingId: string;
    thingFilter: string;
    valueFilter: string;
    orderBy: string;
    skip: number;
    top: number;
}
export interface ThingsRawDataSet {
    things: ThingDTO[];
    itemsRange: ItemsRange;
}
export declare class ThingsDataContext {
    private static apiEndPointAddress;
    private static thingsUrl(thingId?);
    private static thingsValueUrl(thingId);
    private static thingsPositionsUrl();
    private static thingChildrenUrl(parentThingId, childrenId?);
    private static thingDeleteChildUrl(parentThingId, childThingId);
    static init(endPointAddress: EndPointAddress): void;
    static getThing(thingId: string): Promise<ThingDTO | HttpFailResult>;
    static getThings(parameter: ThingsGetParams, canceler?: HttpRequestCanceler): Promise<ThingsRawDataSet | HttpFailResult>;
    static createThing(ThingDTO: ThingDTO): Promise<ThingDTO | HttpFailResult>;
    static updateThing(thingId: string, ThingDTO: ThingDTO): Promise<ThingDTO | HttpFailResult>;
    static deleteThing(thingId: string): Promise<any | HttpFailResult>;
    static getThingChildrenIds(parentThingId: string): Promise<string[] | HttpFailResult>;
    static addChildToParent(parentThingId: string, childThingId: string): Promise<any | HttpFailResult>;
    static deleteThingChild(parentThingId: string, childThingId: string): Promise<any | HttpFailResult>;
    static getThingValue(thingId: string, value: any): Promise<any | HttpFailResult>;
    static putThingValue(thingId: string, value: any): Promise<any | HttpFailResult>;
    static putThingsPositions(positions: ThingPositionRaw[]): Promise<any | HttpFailResult>;
}
