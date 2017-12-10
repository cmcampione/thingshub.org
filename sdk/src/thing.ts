import {UserInfo} from "./userInfo";
import * as thConstants from "../../common/src/thConstants";
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

    public deletedStatus : thConstants.ThingDeletedStates = thConstants.ThingDeletedStates.NoMatter
    public deletedDateTime : Date

    public publicReadClaims : thConstants.ThingUserReadClaims = thConstants.ThingUserReadClaims.NoClaims
    public publicChangeClaims : thConstants.ThingUserChangeClaims = thConstants.ThingUserChangeClaims.NoClaims

    public everyoneReadClaims : thConstants.ThingUserReadClaims = thConstants.ThingUserReadClaims.NoClaims
    public everyoneChangeClaims : thConstants.ThingUserChangeClaims = thConstants.ThingUserChangeClaims.NoClaims

    public userStatus : thConstants.ThingUserStates = thConstants.ThingUserStates.NoMatter
    public userRole : thConstants.ThingUserRoles = thConstants.ThingUserRoles.NoMatter
    public userVisibility: thConstants.ThingUserVisibility = thConstants.ThingUserVisibility.NoMatter

    public userReadClaims: thConstants.ThingUserReadClaims = thConstants.ThingUserReadClaims.NoClaims
    public userChangeClaims: thConstants.ThingUserChangeClaims = thConstants.ThingUserChangeClaims.NoClaims

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