import axios, { AxiosRequestConfig, AxiosPromise, CancelToken } from "axios";
import {HttpRequestCanceler, HttpFailResult, ItemsRange, Helpers} from "./helpers";
import {EndPointAddress} from "./endPointAddress";
import {ThingDTO} from "../../common/src/dtos";
import {ThingPositionRaw} from "./thingPosition";
import * as thingConstants from "../../common/src/constants";

export interface ThingsGetParams {
    parentThingId : string;
    thingFilter : string;
    valueFilter : string;
    orderBy : string;
    skip : number;
    top : number;
}

export interface ThingsRawDataSet {
    things:  ThingDTO[];
    itemsRange: ItemsRange
}

export class ThingsDataContext {

    private static apiEndPointAddress: string = "";
    
    private static thingsUrl(thingId?: string) : string { 
        return ThingsDataContext.apiEndPointAddress + "/things/" + (thingId || ""); 
    }
    private static thingsValueUrl(thingId: string) : string { 
        return ThingsDataContext.apiEndPointAddress + "/things/" + thingId + "/value" 
    }
    private static thingsPositionsUrl() : string {
        return ThingsDataContext.apiEndPointAddress + "/things/positions" 
    }
    private static thingChildrenUrl(parentThingId: string, childrenId?: string) {
        return ThingsDataContext.apiEndPointAddress + "/things/" + (parentThingId) + "/childrenIds/" + (childrenId || "");
    }
    private static thingDeleteChildUrl(parentThingId: string, childThingId: string) {
        return ThingsDataContext.apiEndPointAddress + "/things/" + parentThingId + "/childrenIds/" + childThingId 
    }

    // INFO: Is mandatory call "init"" before the use of this class
    public static init(endPointAddress: EndPointAddress) {

        ThingsDataContext.apiEndPointAddress = endPointAddress.api;
    }

    public static getThing(thingId: string) : Promise<ThingDTO | HttpFailResult> {
        return axios.get(ThingsDataContext.thingsUrl(thingId), {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : ThingDTO {
            return response.data;
        })
    }
    // INFO: To abort call "canceler.cancel()"
    public static getThings(parameter: ThingsGetParams, canceler?: HttpRequestCanceler) : Promise<ThingsRawDataSet | HttpFailResult> {
        
        var urlRaw = ThingsDataContext.thingsUrl() + "?" +
                (!!parameter.parentThingId ? ("&$parentId=" + parameter.parentThingId) : "") +
                (!!parameter.thingFilter ? ("&$thingFilter=" + parameter.thingFilter) : "") +
                (!!parameter.valueFilter ? ("&$valueFilter=" + parameter.valueFilter) : "") +                
                (!!parameter.orderBy ? ("&$orderby=" + parameter.orderBy) : "") +
                (!!parameter.skip ? ("&$skip=" + parameter.skip) : "") +
                (!!parameter.top ? ("&$top=" + parameter.top) : "");

        if (canceler)
            canceler.setup();

        return axios.get(urlRaw, {
                headers: Helpers.securityHeaders,
                cancelToken: (canceler) ? canceler.cancelerToken : null
            })
        .then(function(response: any) : ThingsRawDataSet {
            return {
                things: response.data,
                itemsRange: Helpers.getRangeItemsFromResponse(response)
            }
        })
        .finally(function() {
            /*
            if (canceler)
                canceler.reset();
            */
        });
    }
    
    // TOCHECK: Check Returned data
    public static createThing(ThingDTO: ThingDTO) : Promise<ThingDTO | HttpFailResult> {
        return axios.post(ThingsDataContext.thingsUrl(), ThingDTO, {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : ThingDTO {            
            return response.data;
        })
    }
    // TOCHECK: Check Returned data
    public static updateThing(thingId: string, ThingDTO: ThingDTO) : Promise<ThingDTO | HttpFailResult> {
        return axios.put(ThingsDataContext.thingsUrl(thingId), ThingDTO, {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : ThingDTO {            
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    public static deleteThing(thingId: string) : Promise<any | HttpFailResult> {
        return axios.delete(ThingsDataContext.thingsUrl(thingId), {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : any {            
            return response.data;
        })
    }

    // TOCHECK: Check Returned data
    public static getThingChildrenIds(parentThingId : string) : Promise<string[] | HttpFailResult> {
        return axios.get(ThingsDataContext.thingChildrenUrl(parentThingId), {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : string[] {
            return response.data;
        })
    }

    // TOCHECK: Check Returned data
    public static addChildToParent(parentThingId : string, childThingId : string) : Promise<any | HttpFailResult> {
        return axios.post(ThingsDataContext.thingChildrenUrl(parentThingId), JSON.stringify(childThingId), {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : any {
            return response.data;
        })
    }
    // TOCHECK: Check Returned data
    public static deleteThingChild(parentThingId : string, childThingId : string) : Promise<any | HttpFailResult> {
        return axios.delete(ThingsDataContext.thingDeleteChildUrl(parentThingId, childThingId), {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : any {
            return response.data;
        })
    }

    public static getThingValue(thingId : string, value: any) : Promise<any | HttpFailResult> {
        return axios.get(ThingsDataContext.thingsValueUrl(thingId), {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : any {
            return response.data;
        })
    }
    public static putThingValue(thingId : string, value : any): Promise<any | HttpFailResult> {
        return axios.put(ThingsDataContext.thingsValueUrl(thingId), value, {
            headers: Helpers.securityHeaders
        })
        .then(function(response: any) : any {            
            return response.data;
        })
    }

    // TOCHECK: Check Returned data
    public static putThingsPositions(positions: ThingPositionRaw[]) : Promise<any | HttpFailResult> {
        return axios.put(ThingsDataContext.thingsPositionsUrl(), 
            positions, 
            {
                headers: Helpers.securityHeaders
            })
        .then(function(response: any) : any {            
            return response.data;
        })
    }
}