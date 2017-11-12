"use strict";

const User = require("../models/User");

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

