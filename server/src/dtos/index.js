"use strict";

const sharedConst = require("../sharedConst");

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
		
		this.kind = sharedConst.ThingKind.generic;
		this.kindTxt = sharedConst.ThingKind.genericTxt;
		
		this.pos = 0;
		
		this.deletedStatus = sharedConst.ThingDeletedStates.Ok;
		this.deletedDate = null;
		
		this.publicReadClaims = sharedConst.ThingUserReadClaims.NoClaim;
		this.publicChangeClaims = sharedConst.ThingUserChangeClaims.NoClaim;
		
		this.everyoneReadClaims = sharedConst.ThingUserReadClaims.NoClaim;
		this.everyoneChangeClaims = sharedConst.ThingUserChangeClaims.NoClaim;
		
		this.value = {};
		
		this.userStatus = sharedConst.ThingUserStates.Ok;
		this.userRole = sharedConst.ThingUserRole.User;
		
		this.userReadClaims = sharedConst.ThingUserReadClaims.NoClaim;
		this.userChangeClaims = sharedConst.ThingUserChangeClaims.NoClaim;
		
		this.userVisibility = sharedConst.ThingUserVisibility.Ok;
		
		this.usersInfos = [];
	}
}
exports.ThingDTO = ThingDTO;



