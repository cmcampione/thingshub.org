"use strict";

const mongoose = require("mongoose");

const thConstants = require("../../../common/src/thConstants");

const thingSchema = mongoose.Schema({
	
	_id                   : String,
	creationDate          : Date,
	name                  : String,
	kind                  : String,
	description           : String,
	value                 : {},

	deletedStatus         : { type: Number, default : thConstants.ThingDeletedStates.NoMatter },
	deletedDate       	  : Date,

	publicReadClaims      : { type: Number, default : thConstants.ThingUserReadClaims.NoClaimss },
	publicChangeClaims    : { type: Number, default : thConstants.ThingUserChangeClaims.NoClaims },

	everyoneReadClaims    : { type: Number, default : thConstants.ThingUserReadClaims.NoClaims },
	everyoneChangeClaims  : { type: Number, default : thConstants.ThingUserChangeClaims.NoClaims },

	usersRights : [{
		userId            : mongoose.Schema.Types.ObjectId,
		username          : String,

		userRole          : { type: Number, default : thConstants.ThingUserRoles.NoMatter },
		userStatus        : { type: Number, default : thConstants.ThingUserStates.NoMatter },
		userVisibility    : { type: Number, default : thConstants.ThingUserVisibility.NoMatter },

		userReadClaims    : { type: Number, default : thConstants.ThingUserReadClaims.NoClaims },
		userChangeClaims  : { type: Number, default : thConstants.ThingUserChangeClaims.NoClaims },

		shortPin          : Number
	}],

	parentsThingsIds : [{
		userId : mongoose.Schema.Types.ObjectId,
		parentThingId : String,
		pos  : Number
	}]
});

const Thing = mongoose.model("Thing", thingSchema);

/**
 * Returns a thing if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   _id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findThingById = _id => Thing.findById(_id).exec();

exports.countThings = (query) => Thing.find(query).count().exec();
exports.findThings = (query, orderBy, skip, top) => Thing.find(query).sort(orderBy).skip(skip).limit(top).exec();

exports.save = thing => thing.save(thing);

exports.Thing = Thing;