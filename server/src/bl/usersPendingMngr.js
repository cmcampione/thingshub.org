"use strict";

import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import * as userPendingModel from "../models/UserPending.js";

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}  id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserById = id => userPendingModel.findUserById(id);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   email - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserByEmail = email => userPendingModel.findUserByEmail(email);

export const findUserByEmailAndConfirmToken = (email, confirmationToken) =>
	userPendingModel.findUserByEmailAndConfirmToken(email, confirmationToken);

export const createUserPending = (email) => {
	const userPending = new userPendingModel.UserPending({
		_id: new mongoose.Types.ObjectId(),
		email,
		createdDate : Date.now(),
		confirmationToken : uuid(),
	});
	return userPendingModel.save(userPending);
};

export const deleteUser = userPending => userPendingModel.remove(userPending);
