import * as thConstants from "./thConstants"

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
	
	public kind = thConstants.ThingKind.genericId;
	
	public pos = 0;// Not used during creation or updating of thing
	
	public deletedStatus = thConstants.ThingDeletedStates.NoMatter;
	public deletedDate = null;
	
	public publicReadClaims = thConstants.ThingUserReadClaims.NoClaims;
	public publicChangeClaims = thConstants.ThingUserChangeClaims.NoClaims;
	
	public everyoneReadClaims = thConstants.ThingUserReadClaims.NoClaims;
	public everyoneChangeClaims = thConstants.ThingUserChangeClaims.NoClaims;
	
	public value : any = {};
	
	public userStatus = thConstants.ThingUserStates.NoMatter;
	public userRole = thConstants.ThingUserRoles.NoMatter;
	public userVisibility = thConstants.ThingUserVisibility.NoMatter;
	
	public userReadClaims = thConstants.ThingUserReadClaims.NoClaims;
	public userChangeClaims = thConstants.ThingUserChangeClaims.NoClaims;
	
	public usersInfos : UserInfoDTO[] = []; // Not used during creation or updating of thing
}



