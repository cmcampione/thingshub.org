"use strict";

const httpStatusCodes = require("http-status-codes");
const mongoose = require("mongoose");

const utils = require("../utils");
const constants = require("../sharedConst");
const thingModel = require("../models/Thing");

function findThingById(id) { return thingModel.findThingById(id);}
exports.findThingById = findThingById;

exports.createThing = async (user, thingDTO) => {
	// Validate DTO
	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED,
			httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 13);
	if (thingDTO == null)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_GATEWAY, "The body message is empty", 14);
	if (thingDTO.kind == null)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Kind can't be empty", 15);
	if (thingDTO.name == null)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Name can't be empty", 16);
	if (constants.validateThingDeletedStatus(thingDTO.deletedStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing DeletedStatus is incorrect", 17);
	if (constants.validateThingUserStatus(thingDTO.userStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 18);
	if (constants.validateThingUserRole(thingDTO.userRole) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserRole is incorrect", 19);
        
	// Generate Thing's Id if not in input
	let thingId = !thingDTO.Id ? mongoose.Types.ObjectId() : thingDTO.Id;
	let letterNumber = /^[0-9a-zA-Z-]+$/;  
	if (!thingId.match(letterNumber))
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id is invalid", 20);
        
	if (await findThingById(thingId))
		throw new utils.ErrorCustom(httpStatusCodes.SEE_OTHER, "Thing's Id already exist", 21);

	let thing = new thingModel.Thing();
	thing._Id = thingId;
	thing.creationDate = thingDTO.creationDateTime ? thingDTO.creationDate : Date.now();
	thing.name = thingDTO.name;
	thing.kind = thingDTO.kind;
	thing.value = thingDTO.value;
	thing.deletedStatus = thingDTO.deletedStatus;
	thing.deletedDate = thingDTO.deletedStatus == constants.ThingDeletedStatus.deleted ? Date.now : null;
	thing.publicReadClaims = thingDTO.publicReadClaims;
	thing.publicChangeClaims = thingDTO.publicChangeClaims;
	thing.everyoneReadClaims = thingDTO.everyoneReadClaims;
	thing.everyoneChangeClaims = thingDTO.everyoneChangeClaims;
    
	thing.userRights = [];
	thing.userRights.push({
		userId : user.id,
		username: user.username,
		userRole: thingDTO.userRole,
		userStatus: thingDTO.userStatus,
		thingVisibility: thingDTO.thingVisibility,
		userReadClaims: thingDTO.userReadClaims,
		userChangeClaims: thingDTO.userChangeClaims,
		shortPin: thingDTO.shortPin
	});

	return await thing.save(thing);
};