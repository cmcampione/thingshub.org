"use strict";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
	_id     : mongoose.Schema.Types.ObjectId,
	name    : String,
	username: { type: String, lowercase: true  },
	password: String,
	emails: [{
		email : { type: String, lowercase: true  },
		registrationDate : Date,
		confirmationDate : Date,
		confirmationToken : String,
		isConfirmed : { type: Boolean, default: false },
	}],
	masterApiKey : String,
	isSuperAdministrator : { type: Boolean, default: false }
});

userSchema.pre("save", function save(next) {
	const user = this;
	if (!user.isModified("password")) {
		next();
		return;
	}
	bcrypt.genSalt(10, (err, salt) => {
		if (err) {
			next(err);
			return;
		}
		bcrypt.hash(user.password, salt, (err1, hash) => {
			if (err1) {
				next(err);
				return;
			}
			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
	return bcrypt.compareSync(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);

export const find = filter => User.find(filter).exec();

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   _id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserById = _id => User.findById(_id).exec();

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @param   {Function} done     - The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserByUsername =
		username => User.findOne({ $or: [{ username }, { "emails.email": { $in: [username] } }] }).exec();

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   masterApiKey - The unique user name to find
 * @param   {Function} done     	- The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findUserByMasterApiKey =
	masterApiKey => User.findOne({ "masterApiKey": masterApiKey }).exec();

export const save = user => user.save(user);

