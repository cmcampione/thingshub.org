import { HttpRequestCanceler, ItemsRange, HttpFailResult } from "./helpers";
import { ThingsGetParams, ThingsDTOsDataSet, ThingsDataContext } from "./thingsDataContext";
import { RealtimeConnector } from "./realtimeConnectors";
import { Thing, ThingUserReadClaims, ThingUserChangeClaims, ThingDeletedStates, ThingDTO } from ".";

export interface ThingClaims {

    publicReadClaims : ThingUserReadClaims;
    publicChangeClaims: ThingUserChangeClaims;
    everyoneReadClaims: ThingUserReadClaims;
    everyoneChangeClaims: ThingUserChangeClaims;
    
    creatorUserReadClaims: ThingUserReadClaims;
    creatorUserChangeClaims: ThingUserChangeClaims;
}

export interface ThingsDataSet {
    things:  Thing[];
    itemsRange: ItemsRange
}

export class ThingsManager {
    
    private getThingsParams: ThingsGetParams;
    private getChindrenThingsParams: ThingsGetParams;

    constructor(private mainThing: Thing, 
        private thingKind : string, 
        private thingClaims : ThingClaims,
        private thingsDataContext: ThingsDataContext,
        private realtimeConnector: RealtimeConnector
    ) {
        this.getThingsParams = {
            parentThingId: null,// Overrided by thingsManager
            thingFilter: {$and: [{kind: this.thingKind}, {deletedStatus: ThingDeletedStates.Ok}]},
            top: 10,
            skip: 0, // Overrided by thingsManager
            orderBy: null,
            valueFilter: null
        }
        this.getChindrenThingsParams = {

            parentThingId: null, // Overrided by thingsManager
            thingFilter: {deletedStatus: ThingDeletedStates.Ok},
            top: 10,            
            skip: 0, // Overrided by thingsManager
            orderBy: null,
            valueFilter: null
        }
    }
    public init() {
        this.realtimeConnector.setHook("onCreateThing", this.onCreateThing);
        this.realtimeConnector.setHook("onUpdateThingValue", this.onUpdateThingValue);
    }

    public done() {
        this.realtimeConnector.remHook("onUpdateThingValue", this.onUpdateThingValue);
        this.realtimeConnector.remHook("onCreateThing", this.onCreateThing);
    }

    private searchThingById(id: string): Thing {
        return this.mainThing.children.find((thing) => {
            return thing.id === id;
        })
    }

    private readonly onCreateThing = (thingDTO: ThingDTO) : void => {
        if (thingDTO.kind === this.thingKind) {
            this.mainThing.addThingChild(thingDTO);
            return;
        }
    }

    private readonly onUpdateThingValue = (thingId: string, value: any, asCmd: boolean): void => {
        let thing: Thing = this.searchThingById(thingId);
        if (!thing)
            return;
        if (asCmd)
            return;
        thing.value = value;
    }

    // INFO: Does not change mainThing state
    private async getThings(parameter: ThingsGetParams, canceler: HttpRequestCanceler) : Promise<ThingsDataSet> {

        let thingsDTOsDataSet : ThingsDTOsDataSet = null;
        let things : Thing[] = [];
        
        try {

            thingsDTOsDataSet = await this.thingsDataContext.getThings(parameter, canceler);
            
            for (let i = 0; i < thingsDTOsDataSet.things.length; i++) {
                var thing = new Thing(thingsDTOsDataSet.things[i])
                things.push(thing)
            }
        }
        catch(e) {
            throw e as HttpFailResult
        }

        return {
            things : things,
            itemsRange: thingsDTOsDataSet.itemsRange
        }
    }

    // INFO: Fills parentThing
    // INFO: Does not change mainThing, but parentThing is changed    
    // INFO: "parameter" is changed
    private async getMoreThingChildren(parentThing : Thing, parameter: ThingsGetParams, canceler: HttpRequestCanceler) : Promise<ThingsDataSet> {

        parameter.skip = parentThing.childrenSkip;
        parameter.parentThingId = parentThing.id;

        const thingsDataSet = await this.getThings(parameter, canceler);
        parentThing.childrenTotalItems = thingsDataSet.itemsRange.totalItems;
        parentThing.childrenSkip = parentThing.childrenSkip + parameter.top;
        //  Fix range
        if (parentThing.childrenSkip > parentThing.childrenTotalItems)
            parentThing.childrenSkip = parentThing.childrenTotalItems;

        for (var i = 0; i < thingsDataSet.things.length; i++)
            parentThing.children.push(thingsDataSet.things[i]);
        
        return thingsDataSet;
    }
    // INFO:    In Books example where "this.mainThing" is a "generic root thing" 
    //          "getMoreThings" fills "this.mainThing.children" with "books" collection 
    //          and each "this.mainThing.children[0..n].children" is filled with collection of "generic root thing" like "book comments"
    public async getMoreThings(canceler : HttpRequestCanceler) : Promise<ThingsDataSet[]> {
        let self = this;
        
        var data = await this.getMoreThingChildren(this.mainThing, this.getThingsParams, canceler);
        
        let promises : Promise<ThingsDataSet>[] = [];

        // Try to get all things children
        for (let i = 0; i < data.things.length; i++)
            promises.push(self.getMoreThingChildren(data.things[i], self.getChindrenThingsParams, canceler));

        return Promise.all(promises);
    }

    public getThingsTotalItems() : Number {
        return this.mainThing.childrenTotalItems;
    }

    // Only wrappers
    public async getThing(thingId: string): Promise<Thing> {
        const thingDTO: ThingDTO = await this.thingsDataContext.getThing(thingId);
        return new Thing(thingDTO);
    }
    public async putThingValue(thingId: string, asCmd: boolean, value: any): Promise<any> {
        return await this.thingsDataContext.putThingValue(thingId, asCmd, value);
    }
}
