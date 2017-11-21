"use strict";

const httpStatusCodes = require("http-status-codes");
const uuidv4 = require("uuid/v4");

const utils = require("../utils");
const constants = require("../constants");
const UserInfoDTO = require("../dtos").UserInfoDTO;
const ThingDTO = require("../dtos").ThingDTO;
const usersManager = require("../bl/usersMngr");
const thingModel = require("../models/Thing");

function findThingById(id) { return thingModel.findThingById(id);}

// First search is for userId after it searchs by username
// Can return null
function getThingUserRights(userId, username, thing) {

	if (!userId && !username)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "userId or usernane must be not empty", 28);
	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 27);

	let thingUserRights = null;

	if (userId)
		thingUserRights = thing.usersRights.find(u => u.userId == userId);
	if (!thingUserRights && username)
		thingUserRights = thing.usersRights.find(u => u.username == username);
	
	return thingUserRights;
}

// All paths return to something. It never returns null except for exceptions
// The User may be null as anonymous. If User is anonymous returns Thing's PublicClaims
function getThingUserClaims(user, thing, isSuperAdministrator) {

	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 26);

	let thingUserClaimsAndRights = 
	{
		read    : thing.publicReadClaims,
		change  : thing.publicChangeClaims
	};

	if (user)
	{
		thingUserClaimsAndRights.read   = thingUserClaimsAndRights.read   | thing.everyoneReadClaims;
		thingUserClaimsAndRights.change = thingUserClaimsAndRights.change | thing.everyoneChangeClaims;

		var thingUserRights = getThingUserRights(user._id, user.username, thing);
		if (thingUserRights)
		{
			thingUserClaimsAndRights.read   = thingUserClaimsAndRights.read   | thingUserRights.userReadClaims;
			thingUserClaimsAndRights.change = thingUserClaimsAndRights.change | thingUserRights.userChangeClaims;
		}

		if (isSuperAdministrator)
		{
			thingUserClaimsAndRights.read   = constants.ThingUserReadClaims.AllClaims;
			thingUserClaimsAndRights.change = constants.ThingUserChangeClaims.AllClaims;
		}
	}

	return thingUserClaimsAndRights;
}

// User may be null as it may be anonymous or is a SuperAdministrator who has no relationship with Thing
// It may return null for old Thing created before Position Management
function getThingPosition(user, parentThing, childThing) {

	if (!childThing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Child Thing can't be null", 29);

	// If User is equal to null as it may be anonymous or is a SuperAdministrator who has no relationship with Thing
	if (!user)
		return null;

	let userId = user._id;
	let parentThingId = parentThing ? parentThing._id : null;

	return childThing.positions.find(p => p.userId == userId && p.parentThingId == parentThingId);
}

function createThingPosition(user, parentThing, childThing, pos) {

	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "User can't be null", 24);

	if (!childThing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Child Thing can't be null", 25);
	
	childThing.positions.push({
		userId: user._id,
		parentThingId: parentThing ? parentThing._id : null,
		pos
	});
}

// User may be null because it is anonymous or is a SuperAdministrator who has no relationship with Thing
async function createThingDTO(user, parentThing, thing, isSuperAdministrator) {

	async function getUsersInfosAsync(thing) {
		
		if (!thing)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 32);
		
		let usersInfosDTOs = [];
		
		for(let r of thing.usersRights)
		{
			let userId = r.userId;
			let username = r.username;
		
			if (!userId && !username)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "userId or username must be not empty", 33);
		
			let userInfoDTO = new UserInfoDTO();
				
			userInfoDTO.id = userId;
			userInfoDTO.name = username;
				
			let user = userId ? await usersManager.findUserById(userId) : await	usersManager.findUserByUsername(username);
			if (user) {
				userInfoDTO.id = user.Id;
				userInfoDTO.name = user.name;
			}
		
			usersInfosDTOs.push(userInfoDTO);
		}
		
		return usersInfosDTOs;
	}
	async function thingToThingDTO(accessThingUserClaims, thing, thingUserRights, pos) {
		
		if (!accessThingUserClaims)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "No Correct User's Thing Claims ", 31);
		
		let thingDTO = new ThingDTO();
		
		thingDTO.id = thing._id;
		thingDTO.pos = pos;
		
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadCreationDate) != 0)
			thingDTO.creationDate = thing.creationDate;
		
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadName) != 0)
			thingDTO.name = thing.name;
		
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadKind) != 0)
			thingDTO.kind = thing.kind;
		
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadDeletedStatus) != 0)
		{
			thingDTO.deletedStatus = thing.deletedStatus;
			thingDTO.deletedDate = thing.deletedDate;
		}
		
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadPublicReadClaims) != 0)
			thingDTO.publicReadClaims = thing.publicReadClaims;
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadPublicChangeClaims) != 0)
			thingDTO.publicChangeClaims = thing.publicChangeClaims;
		
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadEveryoneReadClaims) != 0)
			thingDTO.everyoneReadClaims = thing.everyoneReadClaims;
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadEveryoneChangeClaims) != 0)
			thingDTO.everyoneChangeClaims = thing.everyoneChangeClaims;
		
		if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadValue) != 0)
			thingDTO.value = thing.value;
		
		if (thingUserRights && (accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserRights) != 0)
		{
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserStatus) != 0)
				thingDTO.userStatus = thingUserRights.userStatus;
			
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserRole) != 0)
				thingDTO.userRole = thingUserRights.userRole;
		
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserVisibility) != 0)
				thingDTO.userVisibility = thingUserRights.userVisibility;
		
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserReadClaims) != 0)
				thingDTO.userReadClaims = thingUserRights.userReadClaims;
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserChangeClaims) != 0)
				thingDTO.userChangeClaims = thingUserRights.userChangeClaims;

			// TODO: Insert Claims control?
			// TODO: Is useful? Test during shortPin implementation
			thingDTO.shortPin = thingUserRights.shortPin;
		}
		
		thingDTO.usersInfos = (accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserRights) == 0 ? [] : await getUsersInfosAsync(thing);
		
		return thingDTO;
	}

	let loggedInThingUserClaims = getThingUserClaims(user, thing, isSuperAdministrator);

	let loggedInThingUserRights = {
		userRole : (isSuperAdministrator == true) ? constants.ThingUserRole.Administrator : constants.ThingUserRole.User,
		userStatus : constants.ThingUserStates.Ok,
		userVisibility : constants.ThingUserVisibility.Visible,
		userReadClaims : loggedInThingUserClaims.read,
		userChangeClaims : loggedInThingUserClaims.change,
		// TODO: Is it useful? Test during shortPin implementation
		shortPin : 0
	};

	if (user) {
		let loggedInThingUserRights1 = getThingUserRights(user._id, user.username, thing);
		if (loggedInThingUserRights1)
		{
			loggedInThingUserRights.userRole = loggedInThingUserRights1.userRole;
			loggedInThingUserRights.userStatus = loggedInThingUserRights1.userStatus;
			loggedInThingUserRights.userVisibility = loggedInThingUserRights1.userVisibility;
			loggedInThingUserRights.shortPin = loggedInThingUserRights1.shortPin;
			loggedInThingUserRights.userReadClaims = loggedInThingUserRights1.userReadClaims;
			loggedInThingUserRights.userChangeClaims = loggedInThingUserRights1.userChangeClaims;
			// TODO: Is useful? Test during shortPin implementation
			loggedInThingUserRights.shortPin = loggedInThingUserRights1.shortPin;
		}
	}

	let thingPosition = getThingPosition(user, parentThing, thing);
	let thingPos = thingPosition ? thingPosition.pos : constants.DefaultThingPos;

	return await thingToThingDTO(loggedInThingUserClaims, thing, loggedInThingUserRights, thingPos);
}

// Prepare notifications for Users who have a relationship with Thing anyway in Ok or WaitForAuth status and that they are actually registered (Non-users "free" Notifications can not be notified)
async function getUsersIdsToNotify(thing) {

	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 26);

	let UsersIdsToNotify = new Set();

	for(let r of thing.usersRights) {

		if (!(
			((r.userStatus & (constants.ThingUserStates.Ok | constants.ThingUserStates.WaitForAuth)) != 0) &&
			((r.userVisibility & constants.ThingUserVisibility.Visible) != 0))
		)
			continue;

		let userId = r.userId;
		let username = r.username;

		if (!userId && !username)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "both userId and username can't be empty", 27);
	
		let user = userId ? await usersManager.findUserById(userId) : await	usersManager.findUserByUsername(username);
		if (!user)
			continue;
		
		UsersIdsToNotify.add(userId);
	}

	return UsersIdsToNotify;
}

exports.createThing = async (user, thingDTO) => {

	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED,
			httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 13);
	
	// Validate DTO
	if (!thingDTO)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_GATEWAY, "The body message is empty", 14);
	if (!thingDTO.kind)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Kind can't be empty", 15);
	if (!thingDTO.name)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Name can't be empty", 16);
	if (constants.validateThingDeletedStatus(thingDTO.deletedStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing DeletedStatus is incorrect", 17);
	if (constants.validateThingUserStatus(thingDTO.userStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 18);
	if (constants.validateThingUserRole(thingDTO.userRole) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserRole is incorrect", 19);
	if (constants.validateThingUserVisibility(thingDTO.userVisibility) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserVisibility is incorrect", 35);
        
	// Generate Thing's Id if not provided
	let thingId = !thingDTO.id ? uuidv4() : thingDTO.id;
	
	let letterNumber = /^[0-9a-zA-Z-]+$/;  
	if (!thingId.match(letterNumber))
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id is invalid", 20);
        
	if (await findThingById(thingId))
		throw new utils.ErrorCustom(httpStatusCodes.SEE_OTHER, "Thing's Id already exist", 21);

	let thing = new thingModel.Thing();

	thing._id = thingId;
	thing.creationDate = thingDTO.creationDateTime ? thingDTO.creationDate : Date.now();
	thing.name = thingDTO.name;
	thing.kind = thingDTO.kind;
	thing.value = thingDTO.value;
	thing.deletedStatus = thingDTO.deletedStatus;
	thing.deletedDate = thingDTO.deletedStatus == constants.ThingDeletedStates.Deleted ? Date.now : null;
	thing.publicReadClaims = thingDTO.publicReadClaims;
	thing.publicChangeClaims = thingDTO.publicChangeClaims;
	thing.everyoneReadClaims = thingDTO.everyoneReadClaims;
	thing.everyoneChangeClaims = thingDTO.everyoneChangeClaims;
    
	thing.usersRights = [];
	thing.usersRights.push({
		userId : user._id,
		username: user.username,
		userRole: thingDTO.userRole,
		userStatus: thingDTO.userStatus,
		userVisibility: thingDTO.userVisibility,
		userReadClaims: thingDTO.userReadClaims,
		userChangeClaims: thingDTO.userChangeClaims,
		shortPin: thingDTO.shortPin
	});

	createThingPosition(user, null, thing, constants.DefaultThingPos);

	thingModel.save(thing);

	return {
		usersIdsToNotify : await getUsersIdsToNotify(thing),
		thingDTO : await createThingDTO(user, null, thing, false)
	};
};