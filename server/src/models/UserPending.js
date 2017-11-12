"use strict";

const mongoose = require("mongoose");

const userPendingSchema = mongoose.Schema({
	_id               : mongoose.Schema.Types.ObjectId,
	email             : String,
	confirmationToken : String,
	registrationDate  : { type: Date, default: Date.now },
});

const UserPending = mongoose.model("UserPending", userPendingSchema);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   _id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserById = _id => UserPending.findOne({ _id }).exec();

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   email - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserByEmail = email => UserPending.findOne({ email }).exec();

exports.findUserByEmailAndConfirmToken = (email, confirmationToken) =>
	UserPending.findOne({ $and: [{ email }, { confirmationToken }] }).exec();

exports.save = userPending => userPending.save(userPending);

exports.delete = userPending => userPending.remove();

exports.UserPending = UserPending;
