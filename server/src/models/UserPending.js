"use strict";

import mongoose from "mongoose";

const userPendingSchema = mongoose.Schema({
	_id               : mongoose.Schema.Types.ObjectId,
	email             : String,
	confirmationToken : String,
	registrationDate  : { type: Date, default: Date.now },
});

export const UserPending = mongoose.model("UserPending", userPendingSchema);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   _id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserById = _id => UserPending.findOne({ _id }).exec();

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   email - The unique user name to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserByEmail = email => UserPending.findOne({ email }).exec();

export const findUserByEmailAndConfirmToken = (email, confirmationToken) =>
	UserPending.findOne({ $and: [{ email }, { confirmationToken }] }).exec();

export const save = userPending => userPending.save(userPending);

export const remove = userPending => userPending.remove();
