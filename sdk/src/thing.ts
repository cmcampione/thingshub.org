import {UserInfo} from "./userInfo";
//import * as thConstants from "../../common/src/thConstants";
import {ThingDeletedStates, 
	ThingUserReadClaims, ThingUserChangeClaims, 
	ThingUserStates, ThingUserRoles,
	ThingUserVisibility} from "../../common/src/thConstants";
import {ThingDTO} from "../../common/src/dtos";

export class Thing {

    public childrenSkip: number = 0
    public childrenTotalItems = Number.MAX_SAFE_INTEGER

    public children : Thing[] = []

    public id: string = ""
    
    public creationDateTime: Date

    public name:string = ""

    public kind: string = ""

    public pos: number = 0

    public deletedStatus : ThingDeletedStates = ThingDeletedStates.NoMatter
    public deletedDateTime : Date

    public publicReadClaims : ThingUserReadClaims = ThingUserReadClaims.NoClaims
    public publicChangeClaims : ThingUserChangeClaims = ThingUserChangeClaims.NoClaims

    public everyoneReadClaims : ThingUserReadClaims = ThingUserReadClaims.NoClaims
    public everyoneChangeClaims : ThingUserChangeClaims = ThingUserChangeClaims.NoClaims

    public userStatus : ThingUserStates = ThingUserStates.NoMatter
    public userRole : ThingUserRoles = ThingUserRoles.NoMatter
    public userVisibility: ThingUserVisibility = ThingUserVisibility.NoMatter

    public userReadClaims: ThingUserReadClaims = ThingUserReadClaims.NoClaims
    public userChangeClaims: ThingUserChangeClaims = ThingUserChangeClaims.NoClaims

    public usersInfos : UserInfo[] = []
    
    public value: any = {}

    constructor(thingDTO? : ThingDTO) {
        if (thingDTO) {
            Object.assign(this, thingDTO);
            if (thingDTO.value)
                this.value = JSON.parse(thingDTO.value)
        }
    }

    public addThingChild(thingChildDTO : ThingDTO) {
        this.children.unshift(new Thing(thingChildDTO))
    }

    public collapse() : void {
        this.childrenSkip = 0;

        // INFO: Not reset "this.childrenTotalItems = Number.MAX_SAFE_INTEGER" to trace potential Children number
        // this.childrenTotalItems = Number.MAX_SAFE_INTEGER;

        // INFO: Useful to maintain original internal array ref
        this.children.splice(0, this.children.length);
    }

    public shallowCopy() : Thing {

        let copyThing : Thing = new Thing();

        Object.assign(copyThing, this);

        return copyThing;
    }
}