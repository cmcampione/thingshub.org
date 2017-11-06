"use strict";

const uuid = require("uuid/v4");
const mongoose = require("mongoose");
const userPendingModel = require("../models/UserPending.js");

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}  id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserById = id => userPendingModel.findUserById(id);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   email - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserByEmail = email => userPendingModel.findUserByEmail(email);

exports.findUserByEmailAndConfirmToken = (email, confirmationToken) =>
	userPendingModel.findUserByEmailAndConfirmToken(email, confirmationToken);

exports.createUserPending = (email) => {
	const userPending = new userPendingModel.UserPending({
		_id: new mongoose.Types.ObjectId(),
		email,
		createdDate : Date.now(),
		confirmationToken : uuid(),
	});
	return userPendingModel.save(userPending);
};

exports.deleteUser = userPending => userPendingModel.delete(userPending);
