"use strict";

const UserDTO = require("./dto").UserDTO;

// Errors support

class ErrorCustom {
	constructor(statusCode, message, internalCode) {
		this.statusCode = statusCode;
		this.message = {
			internalCode,
			message,
		};
	}
}
exports.ErrorCustom = ErrorCustom;

// DTOs support

exports.MappingModelAndDTO = class MappingModelAndDTO {
	static toUserDTO(user, fullInfos) {
		const userDTO = new UserDTO(user, fullInfos);

		return userDTO;
	}
};

