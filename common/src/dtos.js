"use strict";

const constants = require("./thConstants");

exports.RegisterByOnlyEmailStatus = {
	UserAlreadyRegistered : 1,
	ConfirmPendingEmailSent : 2,
};

class RegisterByOnlyEmailDTO {
	constructor(email, confirmationToken, status) {
		this.email = email;
		this.confirmationToken = confirmationToken;
		this.status = status;
	}
}
exports.RegisterByOnlyEmailDTO = RegisterByOnlyEmailDTO;

class EmailDTO {
	constructor(email) {
		this.value = email.email;
		this.isConfimed = email.isConfimed;
	}
}
exports.EmailDTO = EmailDTO;

class UserDTO { 
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
exports.UserDTO = UserDTO;

class UserInfoDTO {
	constructor() {
	
		this.id = "";
		this.name = "the bees are laborious";
	}
}
exports.UserInfoDTO = UserInfoDTO;

class ThingDTO {
	constructor() {
		
		this.id = "";

		this.creationDate = null;
		
		this.name = "";
		
		this.kind = constants.ThingKind.genericId;
		
		this.pos = 0;// Not used during creation or updating of thing
		
		this.deletedStatus = constants.ThingDeletedStates.NoMatter;
		this.deletedDate = null;
		
		this.publicReadClaims = constants.ThingUserReadClaims.NoClaims;
		this.publicChangeClaims = constants.ThingUserChangeClaims.NoClaims;
		
		this.everyoneReadClaims = constants.ThingUserReadClaims.NoClaims;
		this.everyoneChangeClaims = constants.ThingUserChangeClaims.NoClaims;
		
		this.value = {};
		
		this.userStatus = constants.ThingUserStates.NoMatter;
		this.userRole = constants.ThingUserRoles.NoMatter;
		this.userVisibility = constants.ThingUserVisibility.NoMatter;
		
		this.userReadClaims = constants.ThingUserReadClaims.NoClaims;
		this.userChangeClaims = constants.ThingUserChangeClaims.NoClaims;
		
		this.usersInfos = []; // Not used during creation or updating of thing
	}
}
exports.ThingDTO = ThingDTO;



