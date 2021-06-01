"use strict";

import mongoose from "mongoose";

import * as thConstants from "../../../common/src/thConstants.mjs";

const thingSchema = mongoose.Schema({
	
	_id                   : String,
	creationDate          : Date,
	name                  : String,
	kind                  : String,
	description           : String,
	value                 : {},

	deletedStatus         : { type: Number, default : thConstants.ThingDeletedStates.NoMatter },
	deletedDate       	  : Date,

	publicReadClaims      : { type: Number, default : thConstants.ThingUserReadClaims.NoClaims },
	publicChangeClaims    : { type: Number, default : thConstants.ThingUserChangeClaims.NoClaims },

	everyoneReadClaims    : { type: Number, default : thConstants.ThingUserReadClaims.NoClaims },
	everyoneChangeClaims  : { type: Number, default : thConstants.ThingUserChangeClaims.NoClaims },

	// ToDo
	valueClaims : [{
		fieldName		: String,
		publicReadClaims: { type: Boolean, default : false },
		publicChangeClaims: { type: Boolean, default : false },
		everyoneReadClaims: { type: Boolean, default : false },
		everyoneChangeClaims: { type: Boolean, default : false }
	}],

	usersRights : [{
		userId            : mongoose.Schema.Types.ObjectId,
		username          : String,

		userRole          : { type: Number, default : thConstants.ThingUserRoles.NoMatter },
		userStatus        : { type: Number, default : thConstants.ThingUserStates.NoMatter },
		userVisibility    : { type: Number, default : thConstants.ThingUserVisibility.NoMatter },

		userReadClaims    : { type: Number, default : thConstants.ThingUserReadClaims.NoClaims },
		userChangeClaims  : { type: Number, default : thConstants.ThingUserChangeClaims.NoClaims },

		// ToDo
		valueClaims : [{
			fieldName		: String,
			userReadClaims: { type: Boolean, default : false },
			userChangeClaims: { type: Boolean, default : false }
		}],

		shortPin          : Number
	}],

	parentsThingsIds : [{
		userId : mongoose.Schema.Types.ObjectId,
		parentThingId : String,
		pos  : Number
	}]
});

export const Thing = mongoose.model("Thing", thingSchema);

/**
 * Returns a thing if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   _id - The unique id of the user to find
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */
export const findThingById = _id => Thing.findById(_id).exec();

export const countThings = query => Thing.find(query).count().exec();
export const findThings = (query, orderBy, skip, top) => Thing.find(query).sort(orderBy).skip(skip).limit(top).exec();

export const save = thing => thing.save(thing);
