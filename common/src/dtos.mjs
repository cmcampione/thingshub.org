"use strict";

import { ThingKind, ThingDeletedStates, ThingUserReadClaims, ThingUserChangeClaims, ThingUserStates, ThingUserRoles, ThingUserVisibility } from "./thConstants.mjs";

export const RegisterByOnlyEmailStatus = {
	UserAlreadyRegistered : 1,
	ConfirmPendingEmailSent : 2,
};

export class RegisterByOnlyEmailDTO {
	constructor(email, confirmationToken, status) {
		this.email = email;
		this.confirmationToken = confirmationToken;
		this.status = status;
	}
}
export class EmailDTO {
	constructor(email) {
		this.value = email.email;
		this.isConfimed = email.isConfimed;
	}
}
export class UserDTO { 
	constructor(user, fullInfos) {
		this.id = user._id;
		this.name = user.name;

		if (!fullInfos) {
			return;
		}

		this.emails = [];
		this.username = user.userName;
		user.emails.foreach(email => this.emails.push(new EmailDTO(email)));
		this.masterApiKey = user.masterApiKey;
	}
}

export class UserInfoDTO {
	constructor() {
	
		this.id = "";
		this.name = "the bees are laborious";
	}
}

export class ThingDTO {
	constructor() {
		
		this.id = "";

		this.creationDate = null;
		
		this.name = "";
		
		this.kind = ThingKind.genericId;
		
		this.pos = 0;// Not used during creation or updating of thing
		
		this.deletedStatus = ThingDeletedStates.NoMatter;
		this.deletedDate = null;
		
		this.publicReadClaims = ThingUserReadClaims.NoClaims;
		this.publicChangeClaims = ThingUserChangeClaims.NoClaims;
		
		this.everyoneReadClaims = ThingUserReadClaims.NoClaims;
		this.everyoneChangeClaims = ThingUserChangeClaims.NoClaims;
		
		this.value = {};
		
		this.userStatus = ThingUserStates.NoMatter;
		this.userRole = ThingUserRoles.NoMatter;
		this.userVisibility = ThingUserVisibility.NoMatter;
		
		this.userReadClaims = ThingUserReadClaims.NoClaims;
		this.userChangeClaims = ThingUserChangeClaims.NoClaims;
		
		this.usersInfos = []; // Not used during creation or updating of thing
	}
}



