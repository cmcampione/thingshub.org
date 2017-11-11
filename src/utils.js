"use strict";

const UserDTO = require("./dtos").UserDTO;

// Errors support

class ErrorCustom {
	constructor(statusCode, message, internalCode) {
		this.statusCode = statusCode;
		this.message = {
			internalCode,
			message,
		};
	}
	static formatMessage(internalCode, message) {
		return {
			internalCode,
			message
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

