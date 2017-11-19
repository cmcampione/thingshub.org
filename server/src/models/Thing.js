"use strict";

const mongoose = require("mongoose");

const sharedConst = require("../sharedConst");

const thingSchema = mongoose.Schema({
	_id                   : String,
	creationDate          : Date,
	name                  : String,
	kind                  : String,
	description           : String,
	value                 : {},

	deletedStatus         : { type: Number, default : sharedConst.ThingDeletedStates.Ok },
	deletedDate       	  : Date,

	publicReadClaims      : { type: Number, default : sharedConst.ThingUserReadClaims.NoClaim },
	publicChangeClaims    : { type: Number, default : sharedConst.ThingUserChangeClaims.NoClaim },
	everyoneReadClaims    : { type: Number, default : sharedConst.ThingUserReadClaims.NoClaim },
	everyoneChangeClaims  : { type: Number, default : sharedConst.ThingUserChangeClaims.NoClaim },

	userRights : [{
		userId            : mongoose.Schema.Types.ObjectId,
		username          : String,

		userRole          : { type: Number, default : sharedConst.ThingUserRole.NoMatter },
		userStatus        : { type: Number, default : sharedConst.ThingUserStates.NoMatter },
		thingVisibility   : { type: Number, default : sharedConst.ThingUserVisibility.Visible },

		userReadClaims    : { type: Number, default : sharedConst.ThingUserReadClaims.NoClaim },
		userChangeClaims  : { type: Number, default : sharedConst.ThingUserChangeClaims.NoClaim },

		shortPin          : Number
	}],
  
	parentsThingsIds : [{
		userId : mongoose.Schema.Types.ObjectId,
		parentThingId : Number
	}],
  
	childrenThings: [{
		userId : mongoose.Schema.Types.ObjectId,
		childThingId : mongoose.Schema.Types.ObjectId,
		pos : Number
	}]
});

const Thing = mongoose.model("Thing", thingSchema);

/**
 * Returns a thing if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   _id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
exports.findThingById = _id => Thing.findById(_id).exec();

exports.save = thing => thing.save(thing);

exports.Thing = Thing;