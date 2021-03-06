"use strict";

import httpStatusCodes from "http-status-codes";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { logger } from "./logger.js";
import { UserDTO } from "../../common/src/dtos.mjs";

const __dirname = path.resolve();   

// Errors support

export class ErrorCustom {
	constructor(statusCode, message, internalCode) {
		this.statusCode = statusCode;
		this.message = {
			internalCode,
			message,
		};
		// ToDo: To remove for better place
		logger.error(message,{ code: internalCode });
	}
	static formatMessage(internalCode, message) {
		return {
			internalCode,
			message
		};
	}
}

// DTOs support

export class MappingModelAndDTO {
	static toUserDTO(user, fullInfos) {
		const userDTO = new UserDTO(user, fullInfos);

		return userDTO;
	}
}

export function validateAndFixInputPaging(skip, top) {
	if (!skip)
		skip = 0;
	let maxPagSize = parseInt(process.env.GET_THINGS_MAX_PAGESIZE);
	if (!top || top > maxPagSize)
		top = maxPagSize;
	if (skip < 0 || top < 0)
		throw new ErrorCustom(httpStatusCodes.BAD_REQUEST, "Bad Paging range", 51);
	return { skip, top };
}

// JWT support

/** Private certificate used for signing JSON WebTokens */
const privateKey = fs.readFileSync(path.join(__dirname, "./certs/privatekey.pem"));

/** Public certificate used for verification.  Note: you could also use the private key */
const publicKey = fs.readFileSync(path.join(__dirname, "./certs/certificate.pem"));

/**
 * Creates a signed JSON WebToken and returns it.  Utilizes the private certificate to create
 * the signed JWT.  For more options and other things you can change this to, please see:
 * https://github.com/auth0/node-jsonwebtoken
 *
 * @param  {Number} exp - The number of seconds for this token to expire.  By default it will be 60
 *                        minutes (3600 seconds) if nothing is passed in.
 * @param  {String} sub - The subject or identity of the token.
 * @return {String} The JWT Token
 */
export const createToken = ({ exp = 3600, sub = "", name = "" } = {}) => {
	// Info: Used floor as showed in specifications
	const iat = Math.floor(Date.now() / 1000);
	const token = jwt.sign({
		jti : uuid(),
		sub,
		name,
		exp : iat + exp,
		iat : iat
	}, privateKey, {
		algorithm: "RS256",
	});

	return token;
};

/**
 * Verifies the token through the jwt library using the public certificate.
 * @param   {String} token - The token to verify
 * @throws  {Error} Error if the token could not be verified
 * @returns {Object} The token decoded and verified
 */
export const verifyToken = token => jwt.verify(token, publicKey);