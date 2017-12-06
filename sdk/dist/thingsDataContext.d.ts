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
export interface ThingsDTOsDataSet {
    things: ThingDTO[];
    itemsRange: ItemsRange;
}
export declare class ThingsDataContext {
    private apiEndPointAddress;
    private securityHeaderHook;
    private thingsUrl(thingId?);
    private thingsValueUrl(thingId);
    private thingsPositionsUrl();
    private thingChildrenUrl(parentThingId, childrenId?);
    private thingDeleteChildUrl(parentThingId, childThingId);
    constructor(endPointAddress: EndPointAddress, securityHeaderHook: () => object);
    getThing(thingId: string): Promise<ThingDTO | HttpFailResult>;
    getThings(parameter: ThingsGetParams, canceler?: HttpRequestCanceler): Promise<ThingsDTOsDataSet | HttpFailResult>;
    createThing(ThingDTO: ThingDTO): Promise<ThingDTO | HttpFailResult>;
    updateThing(thingId: string, ThingDTO: ThingDTO): Promise<ThingDTO | HttpFailResult>;
    deleteThing(thingId: string): Promise<any | HttpFailResult>;
    getThingChildrenIds(parentThingId: string): Promise<string[] | HttpFailResult>;
    addChildToParent(parentThingId: string, childThingId: string): Promise<any | HttpFailResult>;
    deleteThingChild(parentThingId: string, childThingId: string): Promise<any | HttpFailResult>;
    getThingValue(thingId: string, value: any): Promise<any | HttpFailResult>;
    putThingValue(thingId: string, value: any): Promise<any | HttpFailResult>;
    putThingsPositions(positions: ThingPositionRaw[]): Promise<any | HttpFailResult>;
}
