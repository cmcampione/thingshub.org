"use strict";

const httpStatusCodes = require("http-status-codes");
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

function validateAndFixInputPaging(skip, top) {
	if (!skip)
		skip = 0;
	let maxPagSize = parseInt(process.env.GET_THINGS_MAX_PAGESIZE);
	if (!top || top > maxPagSize)
		top = maxPagSize;
	if (skip < 0 || top < 0)
		throw new ErrorCustom(httpStatusCodes.BAD_REQUEST, "Bad Paging range", 51);
	return { skip, top };
}
exports.validateAndFixInputPaging = validateAndFixInputPaging;
