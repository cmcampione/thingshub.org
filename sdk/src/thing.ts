import {UserInfo} from "./userInfo";
import * as thingConstants from "../../common/src/constants";
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

    public deletedStatus : thingConstants.ThingDeletedStatus = thingConstants.ThingDeletedStates.NoMatter
    public deletedDateTime : Date

    public publicReadClaims : thingConstants.ThingUserReadClaims = thingConstants.ThingUserReadClaims.NoClaims
    public publicChangeClaims : thingConstants.ThingUserChangeClaims = thingConstants.ThingUserChangeClaims.NoClaims

    public everyoneReadClaims : thingConstants.ThingUserReadClaims = thingConstants.ThingUserReadClaims.NoClaims
    public everyoneChangeClaims : thingConstants.ThingUserChangeClaims = thingConstants.ThingUserChangeClaims.NoClaims

    public userStatus : thingConstants.ThingUserStatus = thingConstants.ThingUserStates.NoMatter
    public userRole : thingConstants.ThingUserRoles = thingConstants.ThingUserRoles.NoMatter
    public userVisibility: thingConstants.ThingUserVisibility = thingConstants.ThingUserVisibility.NoMatter

    public userReadClaims: thingConstants.ThingUserReadClaims = thingConstants.ThingUserReadClaims.NoClaims
    public userChangeClaims: thingConstants.ThingUserChangeClaims = thingConstants.ThingUserChangeClaims.NoClaims

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