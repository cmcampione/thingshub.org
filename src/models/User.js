"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
		bcrypt.hash(user.password, salt, undefined, (err1, hash) => {
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
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		cb(err, isMatch);
	});
};

const User = mongoose.model("User", userSchema);

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   _id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserById = _id => User.findById(_id).exec();

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @param   {Function} done     - The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserByUsername =
		username => User.findOne({ $or: [{ username }, { "emails.email": { $in: [username] } }] }).exec();

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   masterApiKey - The unique user name to find
 * @param   {Function} done     	- The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findUserByMasterApiKey =
	masterApiKey => User.findOne({ "masterApiKey": masterApiKey }).exec();

exports.save = user => user.save(user);

exports.User = User;
