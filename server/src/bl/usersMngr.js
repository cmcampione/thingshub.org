"use strict";

const uuid = require("uuid/v4");
const mongoose = require("mongoose");
const userModel = require("../models/User");

exports.find = filter => userModel.find(filter);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}  id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserById = id => userModel.findUserById(id);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserByUsername = username => userModel.findUserByUsername(username);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserByMasterApiKey = masterApiKey => userModel.findUserByMasterApiKey(masterApiKey);

exports.createUser = (email, name, password, registrationDate, isConfirmed,
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
