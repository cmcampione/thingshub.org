"use strict";

import { v4 as uuid } from "uuid";
import mongoose from "mongoose";
import * as userModel from "../models/User.js";

export const find = filter => userModel.find(filter);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}  id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserById = id => userModel.findUserById(id);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserByUsername = username => userModel.findUserByUsername(username);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserByMasterApiKey = masterApiKey => userModel.findUserByMasterApiKey(masterApiKey);

export const createUser = (email, name, password, registrationDate, isConfirmed,
	confirmationToken, confirmationDate) => {
	const user = new userModel.User({
		_id: new mongoose.Types.ObjectId(),
		name,
		username: email,
		password,
		emails : [{
			email,
			registrationDate,
			confirmationDate,
			confirmationToken,
			isConfirmed,
		}],
		masterApiKey: uuid(),
	});
	// TODO: Test with userModel.save(user);
	return user.save(user);
};
