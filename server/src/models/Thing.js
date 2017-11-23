"use strict";

const mongoose = require("mongoose");

const constants = require("../constants");

const thingSchema = mongoose.Schema({
	
	_id                   : String,
	creationDate          : Date,
	name                  : String,
	kind                  : String,
	description           : String,
	value                 : {},

	deletedStatus         : { type: Number, default : constants.ThingDeletedStates.NoMatter },
	deletedDate       	  : Date,

	publicReadClaims      : { type: Number, default : constants.ThingUserReadClaims.NoClaim },
	publicChangeClaims    : { type: Number, default : constants.ThingUserChangeClaims.NoClaim },

	everyoneReadClaims    : { type: Number, default : constants.ThingUserReadClaims.NoClaim },
	everyoneChangeClaims  : { type: Number, default : constants.ThingUserChangeClaims.NoClaim },

	usersRights : [{
		userId            : mongoose.Schema.Types.ObjectId,
		username          : String,

		userRole          : { type: Number, default : constants.ThingUserRole.NoMatter },
		userStatus        : { type: Number, default : constants.ThingUserStates.NoMatter },
		userVisibility    : { type: Number, default : constants.ThingUserVisibility.NoMatter },

		userReadClaims    : { type: Number, default : constants.ThingUserReadClaims.NoClaim },
		userChangeClaims  : { type: Number, default : constants.ThingUserChangeClaims.NoClaim },

		shortPin          : Number
	}],

	positions: [{
		userId : mongoose.Schema.Types.ObjectId,
		parentThingId : String,
		pos  : Number
	}],
  
	parentsThingsIds : [{
		userId : mongoose.Schema.Types.ObjectId,
		parentThingId : String
	}],
  
	childrenThings: [{
		userId : mongoose.Schema.Types.ObjectId,
		childThingId : String
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
exports.findThings = (query, orderBy, skip, pageSize) => Thing.find(query).sort(orderBy).skip(skip).limit(pageSize).exec();

exports.save = thing => thing.save(thing);

exports.Thing = Thing;