import axios from "axios";
import {HttpRequestCanceler, ItemsRange, Helpers} from "./helpers";
import {EndPointAddress} from "./endPointAddress";
import {ThingDTO} from "../../common/src/dtos";
import {ThingPositionRaw} from "./thingPosition";

export interface ThingsGetParams {
    parentThingId : string | null;
    thingFilter : object;
    valueFilter : object | null;
    orderBy : string | null;
    skip : number;
    top : number;
}

export interface ThingsDTOsDataSet {
    things:  ThingDTO[];
    itemsRange: ItemsRange
}

export class ThingsDataContext {

    private apiEndPointAddress: string = "";
    
    private thingsUrl(thingId?: string) : string { 
        return this.apiEndPointAddress + "/things/" + (thingId || ""); 
    }
    private thingsValueUrl(thingId: string) : string { 
        return this.apiEndPointAddress + "/things/" + thingId + "/value"
    }
    private thingsCmdUrl(thingId: string) : string { 
        return this.apiEndPointAddress + "/things/" + thingId + "/cmd"
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

    public constructor(endPointAddress: EndPointAddress) {

        this.apiEndPointAddress = endPointAddress.api;
    }

    public async getThing(thingId: string): Promise<ThingDTO> {
        const response = await axios.get(this.thingsUrl(thingId));
        return response.data;
    }
    // Info: To abort call "canceler.cancel()"
    public getThings(parameter: ThingsGetParams, canceler?: HttpRequestCanceler): Promise<ThingsDTOsDataSet> {
        
        var urlRaw = this.thingsUrl() + "?" +
                (!!parameter.parentThingId ? ("&parentThingId=" + parameter.parentThingId) : "") +
                (!!parameter.thingFilter ? ("&thingFilter=" + JSON.stringify(parameter.thingFilter)) : "") +
                (!!parameter.valueFilter ? ("&valueFilter=" + JSON.stringify(parameter.valueFilter)) : "") +                
                (!!parameter.orderBy ? ("&orderBy=" + parameter.orderBy) : "") +
                (!!parameter.skip ? ("&skip=" + parameter.skip) : "") +
                (!!parameter.top ? ("&top=" + parameter.top) : "");

        return axios.get(urlRaw, {
                cancelToken: (canceler) ? canceler.cancelerToken : undefined
            })
        .then(function(response: any) : ThingsDTOsDataSet {
            return {
                things: response.data,
                itemsRange: Helpers.getRangeItemsFromResponse(response)
            }
        })
        .catch(function(response) {
            // ToDo: response in undefined if request was cancelled
            if (axios.isCancel(response)) {
                console.log('Request canceled', response.message);
            }
            throw(response);
        })       
        .finally(function() {
        });
    }
    
    // ToCheck: Check Returned data
    public async createThing(ThingDTO: ThingDTO): Promise<ThingDTO> {
        const response = await axios.post(this.thingsUrl(), ThingDTO);
        return response.data;
    }
    // ToCheck: Check Returned data
    public async updateThing(thingId: string, ThingDTO: ThingDTO): Promise<ThingDTO> {
        const response = await axios.put(this.thingsUrl(thingId), ThingDTO);
        return response.data;
    }
    // ToCheck: Check Returned data
    public async deleteThing(thingId: string): Promise<any> {
        const response = await axios.delete(this.thingsUrl(thingId));
        return response.data;
    }

    // ToCheck: Check Returned data
    public async getThingChildrenIds(parentThingId : string): Promise<string[]> {
        const response = await axios.get(this.thingChildrenUrl(parentThingId));
        return response.data;
    }

    // ToCheck: Check Returned data
    public async addChildToParent(parentThingId : string, childThingId : string): Promise<any> {
        const response = await axios.post(this.thingChildrenUrl(parentThingId), JSON.stringify(childThingId));
        return response.data;
    }
    // ToCheck: Check Returned data
    public async deleteThingChild(parentThingId : string, childThingId : string): Promise<any> {
        const response = await axios.delete(this.thingDeleteChildUrl(parentThingId, childThingId));
        return response.data;
    }

    public async getThingValue(thingId : string): Promise<any> {
        const response = await axios.get(this.thingsValueUrl(thingId));
        return response.data;
    }
    public async putThingValue(thingId : string, asCmd: boolean, value : any): Promise<any> {
        let url: string = asCmd ? this.thingsCmdUrl(thingId) : this.thingsValueUrl(thingId);
        const response = await axios.put(url, value);
        return response.data;
    }

    // ToCheck: Check Returned data
    public async putThingsPositions(positions: ThingPositionRaw[]): Promise<any> {
        const response = await axios.put(this.thingsPositionsUrl(), positions);
        return response.data;
    }
}
