//import * as thConstants from "./thConstants"
import {ThingDeletedStates, 
	ThingUserReadClaims, ThingUserChangeClaims, 
	ThingUserStates, ThingUserRoles,
	ThingUserVisibility} from "./thConstants"

export declare const enum RegisterByOnlyEmailStatus {
	UserAlreadyRegistered = 1,
	ConfirmPendingEmailSent = 2
}

export declare class RegisterByOnlyEmailDTO {
	public email : string;
	public confirmationToken: string;
	public status : any;

	constructor(email, confirmationToken, status);
}

export declare class EmailDTO {
	public value : string;
	public isConfirmed :  boolean;
	constructor(email);
}

export declare class UserDTO { 
	public id : string;
	public name : string;
	public username : string;
	public emails : EmailDTO[];
	public masterApiKey : string;

	constructor(user, fullInfos);
}

export declare class UserInfoDTO {
	public id : string;
	public name : string;
	constructor();
}

export declare class ThingDTO {
	public id : string;
	
	public creationDate : Date;
	
	public name : string;
	
	public kind : string;
	
	public pos : number;// Not used during creation or updating of thing
	
	public deletedStatus : ThingDeletedStates;
	public deletedDate  : Date;
	
	public publicReadClaims : ThingUserReadClaims;
	public publicChangeClaims : ThingUserChangeClaims;
	
	public everyoneReadClaims : ThingUserReadClaims;
	public everyoneChangeClaims : ThingUserChangeClaims;
	
	public value : any;
	
	public userStatus : ThingUserStates;
	public userRole : ThingUserRoles;
	public userVisibility : ThingUserVisibility;
	
	public userReadClaims : ThingUserReadClaims;
	public userChangeClaims : ThingUserChangeClaims;
	
	public usersInfos : UserInfoDTO[];
}
