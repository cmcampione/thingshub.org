import axios, { AxiosRequestConfig, AxiosPromise, CancelToken } from "axios";
import {HttpRequestCanceler, HttpFailResult, ItemsRange, Helpers} from "./helpers";
import {EndPointAddress} from "./endPointAddress";
import {ThingDTO} from "../../common/src/dtos";
import {ThingPositionRaw} from "./thingPosition";

export interface ThingsGetParams {
    parentThingId : string;
    thingFilter : object;
    valueFilter : object;
    orderBy : string;
    skip : number;
    top : number;
}

export interface ThingsDTOsDataSet {
    things:  ThingDTO[];
    itemsRange: ItemsRange
}

export class ThingsDataContext {

    private apiEndPointAddress: string = "";
    private securityHeaderHook: () => object = null;
    
    private thingsUrl(thingId?: string) : string { 
        return this.apiEndPointAddress + "/things/" + (thingId || ""); 
    }
    private thingsValueUrl(thingId: string) : string { 
        return this.apiEndPointAddress + "/things/" + thingId + "/value" 
    }
    private thingsPositionsUrl() : string {
        return this.apiEndPointAddress + "/things/positions" 
    }
    private thingChildrenUrl(parentThingId: string, childrenId?: string) {
        return this.apiEndPointAddress + "/things/" + (parentThingId) + "/childrenIds/" + (childrenId || "");
    }
    private thingDeleteChildUrl(parentThingId: string, childThingId: string) {
        return this.apiEndPointAddress + "/things/" + parentThingId + "/childrenIds/" + childThingId 
    }

    public  constructor(endPointAddress: EndPointAddress, securityHeaderHook: () => object) {

        this.apiEndPointAddress = endPointAddress.api;
        this.securityHeaderHook = securityHeaderHook;
    }

    public  getThing(thingId: string) : Promise<ThingDTO | HttpFailResult> {
        return axios.get(this.thingsUrl(thingId), {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : ThingDTO {
            return response.data;
        })
    }
    // INFO: To abort call "canceler.cancel()"
    public  getThings(parameter: ThingsGetParams, canceler?: HttpRequestCanceler) : Promise<ThingsDTOsDataSet | HttpFailResult> {
        
        var urlRaw = this.thingsUrl() + "?" +
                (!!parameter.parentThingId ? ("&parentThingId=" + parameter.parentThingId) : "") +
                (!!parameter.thingFilter ? ("&thingFilter=" + JSON.stringify(parameter.thingFilter)) : "") +
                (!!parameter.valueFilter ? ("&valueFilter=" + JSON.stringify(parameter.valueFilter)) : "") +                
                (!!parameter.orderBy ? ("&orderBy=" + parameter.orderBy) : "") +
                (!!parameter.skip ? ("&skip=" + parameter.skip) : "") +
                (!!parameter.top ? ("&top=" + parameter.top) : "");

        if (canceler)
            canceler.setup();

        return axios.get(urlRaw, {
                headers: this.securityHeaderHook(),
                cancelToken: (canceler) ? canceler.cancelerToken : null
            })
        .then(function(response: any) : ThingsDTOsDataSet {
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
    public  createThing(ThingDTO: ThingDTO) : Promise<ThingDTO | HttpFailResult> {
        return axios.post(this.thingsUrl(), ThingDTO, {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : ThingDTO {            
            return response.data;
        })
    }
    // TOCHECK: Check Returned data
    public  updateThing(thingId: string, ThingDTO: ThingDTO) : Promise<ThingDTO | HttpFailResult> {
        return axios.put(this.thingsUrl(thingId), ThingDTO, {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : ThingDTO {            
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    public  deleteThing(thingId: string) : Promise<any | HttpFailResult> {
        return axios.delete(this.thingsUrl(thingId), {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : any {            
            return response.data;
        })
    }

    // TOCHECK: Check Returned data
    public  getThingChildrenIds(parentThingId : string) : Promise<string[] | HttpFailResult> {
        return axios.get(this.thingChildrenUrl(parentThingId), {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : string[] {
            return response.data;
        })
    }

    // TOCHECK: Check Returned data
    public  addChildToParent(parentThingId : string, childThingId : string) : Promise<any | HttpFailResult> {
        return axios.post(this.thingChildrenUrl(parentThingId), JSON.stringify(childThingId), {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : any {
            return response.data;
        })
    }
    // TOCHECK: Check Returned data
    public  deleteThingChild(parentThingId : string, childThingId : string) : Promise<any | HttpFailResult> {
        return axios.delete(this.thingDeleteChildUrl(parentThingId, childThingId), {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : any {
            return response.data;
        })
    }

    public  getThingValue(thingId : string) : Promise<any | HttpFailResult> {
        return axios.get(this.thingsValueUrl(thingId), {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : any {
            return response.data;
        })
    }
    public  putThingValue(thingId : string, value : any): Promise<any | HttpFailResult> {
        return axios.put(this.thingsValueUrl(thingId), value, {
            headers: this.securityHeaderHook()
        })
        .then(function(response: any) : any {            
            return response.data;
        })
    }

    // TOCHECK: Check Returned data
    public  putThingsPositions(positions: ThingPositionRaw[]) : Promise<any | HttpFailResult> {
        return axios.put(this.thingsPositionsUrl(), 
            positions, 
            {
                headers: this.securityHeaderHook()
            })
        .then(function(response: any) : any {            
            return response.data;
        })
    }
}