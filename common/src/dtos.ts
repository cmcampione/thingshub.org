import * as constants from "./constants"  

export const enum RegisterByOnlyEmailStatus {
	UserAlreadyRegistered = 1,
	ConfirmPendingEmailSent = 2
}

export class RegisterByOnlyEmailDTO {
	public email : string;
	public confirmationToken: string;
	public status : any;

	constructor(email, confirmationToken, status) {
		this.email = email;
		this.confirmationToken = confirmationToken;
		this.status = status;
	}
}

export class EmailDTO {
	public value : string;
	public isConfirmed :  boolean;
	constructor(email) {
		this.value = email.email;
		this.isConfirmed = email.isConfirmed;
	}
}

export class UserDTO { 
	public id : string;
	public name : string;
	public username : string;
	public emails : EmailDTO[];
	public masterApiKey : string;

	constructor(user, fullInfos) {
		this.id = user._id;
		this.name = user.name;
		this.username = "";
		this.emails = [];
  
		if (!fullInfos) {
			return;
		}
  
		this.username = user.userName;
		user.emails.foreach(email => this.emails.push(new EmailDTO(email)));
		this.masterApiKey = user.masterApiKey;
	}
}

export class UserInfoDTO {
	public id : string;
	public name : string;
	constructor() {
	
		this.id = "";
		this.name = "the bees are laborious";
	}
}

export class ThingDTO {
	public id = "";
	
	public creationDate = null;
	
	public name = "";
	
	public kind = constants.ThingKind.genericId;
	
	public pos = 0;// Not used during creation or updating of thing
	
	public deletedStatus = constants.ThingDeletedStates.NoMatter;
	public deletedDate = null;
	
	public publicReadClaims = constants.ThingUserReadClaims.NoClaims;
	public publicChangeClaims = constants.ThingUserChangeClaims.NoClaims;
	
	public everyoneReadClaims = constants.ThingUserReadClaims.NoClaims;
	public everyoneChangeClaims = constants.ThingUserChangeClaims.NoClaims;
	
	public value = {};
	
	public userStatus = constants.ThingUserStates.NoMatter;
	public userRole = constants.ThingUserRoles.NoMatter;
	public userVisibility = constants.ThingUserVisibility.NoMatter;
	
	public userReadClaims = constants.ThingUserReadClaims.NoClaims;
	public userChangeClaims = constants.ThingUserChangeClaims.NoClaims;
	
	public usersInfos : UserInfoDTO[] = []; // Not used during creation or updating of thing
}



