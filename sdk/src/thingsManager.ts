import { HttpRequestCanceler, ItemsRange, HttpFailResult } from "./helpers";
import { ThingsGetParams, ThingsDTOsDataSet, ThingsDataContext } from "./thingsDataContext";
import { Connector } from "./connector";
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
        private realTimeConnector: Connector
    ) {
        this.getThingsParams = {
            // Viene sovrascritto da thingsManager
            parentThingId: null,
            thingFilter: {$and: [{kind: this.thingKind}, {deletedStatus: ThingDeletedStates.Ok}]},
            top: 10,
            skip: 0,
            orderBy: null,
            valueFilter: null
        }
        this.getChindrenThingsParams = {
            // Viene sovrascritto da thingsManager
            parentThingId: null,
            thingFilter: {deletedStatus: ThingDeletedStates.Ok},
            top: 10,
            // Viene sovrascritto da thingsManager
            skip: 0,
            orderBy: null,
            valueFilter: null
        }

        this.realTimeConnector.setHook("onCreateThing", this.onCreateThing);
    }

    private onCreateThing = (thingDTO: ThingDTO) : void => {
        if (thingDTO.kind == this.thingKind) {
            this.mainThing.addThingChild(thingDTO);
            return;
        }
    }

    private async getThings(parameter: ThingsGetParams , canceler: HttpRequestCanceler) : Promise<ThingsDataSet> {

        let thingsDTOsDataSet : ThingsDTOsDataSet = null
        let things : Thing[] = []
        
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
    // INFO: "thing.children" is filled filtered by "this.getChindrenThingsParams"
    public getMoreThingChildren(parentThing : Thing, parameter: ThingsGetParams, canceler: HttpRequestCanceler) : Promise<ThingsDataSet> {

        parameter.skip = parentThing.childrenSkip;
        parameter.parentThingId = parentThing.id;

        return this.getThings(parameter, canceler)
        .then(function (thingsDataSet : ThingsDataSet) : ThingsDataSet  {

            parentThing.childrenTotalItems = thingsDataSet.itemsRange.totalItems;
            parentThing.childrenSkip = parentThing.childrenSkip + parameter.top;
            //  Fix range
            if (parentThing.childrenSkip > parentThing.childrenTotalItems)
                parentThing.childrenSkip = parentThing.childrenTotalItems;            

            for (var i = 0; i < thingsDataSet.things.length;i++)
                parentThing.children.push(thingsDataSet.things[i]);   

            return thingsDataSet;
        });
    }
    // INFO:    In Books example where "this.mainThing" in a "root thing" 
    //          "getMoreThings" fills "this.mainThing.children" with "books" collection 
    //          and "this.mainThing.children[0..n].children" with "things" collection like "book comments"
    public getMoreThings = (canceler : HttpRequestCanceler) : Promise<ThingsDataSet[]> => {
        
        let self = this;

        return new Promise<ThingsDataSet[]>((resolve, reject) => {

            this.getMoreThingChildren(this.mainThing, this.getThingsParams, canceler)
            .then(function (data : ThingsDataSet) : any {

                let promises : Promise<ThingsDataSet>[] = [];

                // Try to get all things children
                for (let i = 0; i < data.things.length; i++)
                    promises.push(self.getMoreThingChildren(data.things[i], self.getChindrenThingsParams, canceler));

                Promise.all(promises)
                .then(function(data : ThingsDataSet[]) : any {
                    resolve(data);
                    return data;
                })
                .catch(function(data) : HttpFailResult {
                    reject(data);
                    return data;
                });

                return data;
                
            })
            .catch(function(data) : HttpFailResult {
                reject(data);
                return data;
            })
        });
    }

    public getThingsTotalItems() : Number {
        return this.mainThing.childrenTotalItems;
    }
}