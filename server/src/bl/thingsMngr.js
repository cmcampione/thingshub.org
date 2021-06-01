"use strict";

import httpStatusCodes from "http-status-codes";
import * as utils from "../utils.js";
import { v4 as uuid } from "uuid";
import * as thConstants from "../../../common/src/thConstants.mjs";
import { UserInfoDTO, ThingDTO } from "../../../common/src/dtos.mjs";
import * as usersManager from "../bl/usersMngr.js";
import * as thingModel from "../models/Thing.js";

function findThingById(id) { return thingModel.findThingById(id);}
function countThings(query) { return thingModel.countThings(query);}
function findThings(query, orderBy, skip, top) { return thingModel.findThings(query, orderBy, skip, top);}

// First search is by userId after it searchs by username
// Can return null
function getThingUserRights(userId, username, thing)
{
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

// All paths return something. It never returns null except for exceptions
// The User may be null as anonymous. If User is anonymous returns Thing's PublicClaims
function getThingUserClaims(user, thing, isSuperAdministrator) {

	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 26);

	let thingUserClaims = {
		read    : thing.publicReadClaims,
		change  : thing.publicChangeClaims
	};

	if (user) {
		if (isSuperAdministrator)
		{
			thingUserClaims.read   = thConstants.ThingUserReadClaims.AllClaims;
			thingUserClaims.change = thConstants.ThingUserChangeClaims.AllClaims;

			return thingUserClaims;
		}

		thingUserClaims.read   = thingUserClaims.read   | thing.everyoneReadClaims;
		thingUserClaims.change = thingUserClaims.change | thing.everyoneChangeClaims;

		var thingUserRights = getThingUserRights(user._id, user.username, thing);
		if (thingUserRights)
		{
			thingUserClaims.read   = thingUserClaims.read   | thingUserRights.userReadClaims;
			thingUserClaims.change = thingUserClaims.change | thingUserRights.userChangeClaims;
		}
	}

	return thingUserClaims;
}

function checkThingAccess(user, thing, deletedStatus, userRole, userStatus, userVisibility) {

	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing not valid", 36);

	if (deletedStatus != thConstants.ThingDeletedStates.NoMatter && thing.deletedStatus != deletedStatus)
		return false;

	if ((thing.publicReadClaims & thConstants.ThingUserReadClaims.AllClaims) != 0 || (thing.publicChangeClaims & thConstants.ThingUserChangeClaims.AllClaims) != 0)
	{
		if (!user && userRole == thConstants.ThingUserRoles.NoMatter 
			&& userStatus == thConstants.ThingUserStates.NoMatter
			&& userVisibility == thConstants.ThingUserVisibility.NoMatter)
			return true;
	}

	if (!user)
		return false;

	// If User is Super Administrator returns Thing whatever the pass filters (userRole) passed as parameters
	if (user.isSuperAdministrator)
		return true;

	// Priority control if the User has a relationship with the Thing
	var thingUserRights = getThingUserRights(user._id, user.userName, thing);
	if (thingUserRights)
	{
		if (userStatus != thConstants.ThingUserStates.NoMatter && ((thingUserRights.userStatus & userStatus) == 0))
			return false;

		if (userRole != thConstants.ThingUserRoles.NoMatter && ((thingUserRights.userRole & userRole) == 0))
			return false;

		if (userVisibility != thConstants.ThingUserVisibility.NoMatter && ((thingUserRights.userVisibility & userVisibility) == 0))
			return false;
	}

	if ((thing.everyoneReadClaims & thConstants.ThingUserReadClaims.AllClaims) != 0 || (thing.everyoneChangeClaims & thConstants.ThingUserChangeClaims.AllClaims) != 0)
		return true;

	// If the User has no relationship with Thing does not pass
	if (!thingUserRights)
		return false;

	if (userStatus != thConstants.ThingUserStates.NoMatter && ((thingUserRights.userStatus & userStatus) == 0))
		return false;

	if (userRole != thConstants.ThingUserRoles.NoMatter && ((thingUserRights.userRole & userRole) == 0))
		return false;

	if (userVisibility != thConstants.ThingUserVisibility.NoMatter && ((thingUserRights.userVisibility & userVisibility) == 0))
		return false;

	return true;
}

// Not optimized using the CheckThingAccess function.
// It does not get optimized because staying so you have a capillary control of where it eventually snaps the error
async function _getThing(user, thingId, deletedStatus, userRole, userStatus, userVisibility) {

	if (!thingId)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id not valid", 37);

	let thing = await findThingById(thingId);
	if (!thing)
	{
		// Returns httpStatusCodes.UNAUTHORIZED to Reset Some Malicious Logon Access
		if (!user)
			throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, "Unauthorized user", 38);
		throw new utils.ErrorCustom(httpStatusCodes.NOT_FOUND, "Thing not found", 39);
	}

	if (deletedStatus != thConstants.ThingDeletedStates.NoMatter && thing.deletedStatus != deletedStatus)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Deletedstatus not valid", 40);

	if ((thing.publicReadClaims & thConstants.ThingUserReadClaims.AllClaims) != 0 
		|| (thing.publicChangeClaims & thConstants.ThingUserChangeClaims.AllClaims) != 0)
	{
		// This is a condition I do not remember why it was put on. I consider it important.
		// At this time it is commented why when I try to assign a pos to Thing
		// for an unnamed user who does not have a relationship with Thing the condition does not let me pass.
		// if (user == null && userRole == ThingUserRoles.NoMatter && userStatus == ThingUserStates.NoMatter && userVisibility == thConstants.ThingUserVisibility.NoMatter)
		return thing;
	}

	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, "Unauthorized user", 41);

	// If User is Super Administrator returns Thing whatever filters(userRole) are passed as parameters
	/*
	// ToDo: Manage when User is a SuperAdministrator
	if (user.isSuperAdministrator)
		return thing;
	*/

	if ((thing.everyoneReadClaims & thConstants.ThingUserReadClaims.AllClaims) != 0 
		|| (thing.everyoneChangeClaims & thConstants.ThingUserChangeClaims.AllClaims) != 0)
		return thing;

	var thingUserRights = getThingUserRights(user._id, user.username, thing);
	if (thingUserRights)
	{
		if (userStatus != thConstants.ThingUserStates.NoMatter && ((thingUserRights.userStatus & userStatus) == 0))
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 42);

		if (userRole != thConstants.ThingUserRoles.NoMatter && ((thingUserRights.userRole & userRole) == 0))
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 43);

		if (userVisibility != thConstants.ThingUserVisibility.NoMatter && ((thingUserRights.userVisibility & userVisibility) == 0))
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 48);

		return thing;
	}

	throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 44);
}

async function _getThings(user, parentThingId, thingFilter, valueFilter, orderBy, skip, top) {

	let paging = utils.validateAndFixInputPaging(skip, top);

	skip = paging.skip;
	top = paging.top;

	let mainThingsQuery = {};

	mainThingsQuery["$and"] = [];

	let publicEveryoneUserQuery = {};

	if (!user) {

		publicEveryoneUserQuery["$or"] = [];
		
		publicEveryoneUserQuery["$or"].push({publicReadClaims: { $bitsAnySet: thConstants.ThingUserReadClaims.AllClaims }});
		publicEveryoneUserQuery["$or"].push({publicChangeClaims: { $bitsAnySet: thConstants.ThingUserChangeClaims.AllClaims }});
	}

	if (user && !user.isSuperAdministrator)	{

		publicEveryoneUserQuery["$or"] = [];

		publicEveryoneUserQuery["$or"].push({publicReadClaims: { $bitsAnySet: thConstants.ThingUserReadClaims.AllClaims }});
		publicEveryoneUserQuery["$or"].push({publicChangeClaims: { $bitsAnySet: thConstants.ThingUserChangeClaims.AllClaims }});

		publicEveryoneUserQuery["$or"].push({everyoneReadClaims: { $bitsAnySet: thConstants.ThingUserReadClaims.AllClaims }});
		publicEveryoneUserQuery["$or"].push({everyoneChangeClaims: { $bitsAnySet: thConstants.ThingUserChangeClaims.AllClaims }});

		let userRightsQuery = {};
		userRightsQuery["$and"] = [];

		let userIdUsernameQuery = {};
		userIdUsernameQuery["$or"] = [];
		userIdUsernameQuery["$or"].push({"usersRights.userId": user._id });
		userIdUsernameQuery["$or"].push({"usersRights.username": user.username });

		userRightsQuery["$and"].push(userIdUsernameQuery);

		let userStatusVisibilityQuery = {};
		userStatusVisibilityQuery["$and"] = [];
		userStatusVisibilityQuery["$and"].push({"usersRights.userStatus": {$bitsAnySet: (thConstants.ThingUserStates.Ok | thConstants.ThingUserStates.WaitForAuth) }});
		userStatusVisibilityQuery["$and"].push({"usersRights.userVisibility": {$bitsAnySet: thConstants.ThingUserVisibility.Visible }});
		
		userRightsQuery["$and"].push(userStatusVisibilityQuery);

		publicEveryoneUserQuery["$or"].push(userRightsQuery);
	}

	mainThingsQuery["$and"].push(publicEveryoneUserQuery);

	let parentThing = null;
	if (parentThingId) {
		
		parentThing = await _getThing(user, parentThingId, thConstants.ThingDeletedStates.Ok, 
			thConstants.ThingUserRoles.NoMatter, thConstants.ThingUserStates.Ok, thConstants.ThingUserVisibility.Visible);
		mainThingsQuery["$and"].push({parentsThingsIds: { $elemMatch: {userId: user ? user._id : null, parentThingId }}} );
	}

	if (thingFilter)
		mainThingsQuery["$and"].push(thingFilter);	

	if (valueFilter)
		mainThingsQuery["$and"].push(valueFilter);

	let totalItems =  await countThings(mainThingsQuery);

	if (skip > totalItems)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Skip param is not valid",53);

	if (skip + top > totalItems)
		top = totalItems - skip;

	let order = orderBy ? orderBy : { "parentsThingsIds.pos": 1 };

	let dummy = JSON.stringify(mainThingsQuery);
	let things = await findThings(mainThingsQuery, order, skip, top);

	let thingsDTO = [];
	for(let thing of things)
		thingsDTO.push(await createThingDTO(user, parentThing, thing, user ? user.isSuperAdministrator : false));

	return {
		totalItems,
		skip,
		top,
		thingsDTO
	};
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

	return childThing.parentsThingsIds.find(p => p.userId == userId && p.parentThingId == parentThingId);
}

function createThingPosition(user, parentThing, childThing, pos) {

	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "User can't be null", 24);

	if (!childThing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Child Thing can't be null", 25);
	
	childThing.parentsThingsIds.push({
		userId: user._id,
		parentThingId: parentThing ? parentThing._id : null,
		pos
	});
}

// Prepare notifications for Users who have a relationship with Thing anyway in Ok or WaitForAuth status 
// and that they are actually registered (Non-users "free" Notifications can not be notified)
async function getUsersIdsToNotify(thing, checkValueAccess) {
	
	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 26);
	
	let UsersIdsToNotify = new Set();
	
	for(let r of thing.usersRights) {
	
		if (!(
			((r.userStatus & (thConstants.ThingUserStates.Ok | thConstants.ThingUserStates.WaitForAuth)) != 0) &&
				((r.userVisibility & thConstants.ThingUserVisibility.Visible) != 0))
		)
			continue;

		let userId = r.userId;
		let username = r.username;
	
		if (!userId && !username)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Both userId and username can't be empty", 27);
		
		let user = userId ? await usersManager.findUserById(userId) : await	usersManager.findUserByUsername(username);
		if (!user)
			continue;

		if (checkValueAccess) {
			let thingUserClaims = getThingUserClaims(user, thing, user.isSuperAdministrator);
			if ((thingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeValue) == 0)
				continue;
		}
			
		UsersIdsToNotify.add(userId);
	}
	
	return UsersIdsToNotify;
}

// User may be null because it is anonymous or is a SuperAdministrator who has no relationship with Thing
async function createThingDTO(user, parentThing, thing, isSuperAdministrator) {

	async function getUsersInfosAsync(thing) {
		
		if (!thing)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 32);
		
		let usersInfosDTOs = [];
		
		for(let r of thing.usersRights) {

			let userId = r.userId;
			let username = r.username;
		
			if (!userId && !username)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "userId or username must be not empty", 33);
		
			let userInfoDTO = new UserInfoDTO();
				
			userInfoDTO.id = userId;
			userInfoDTO.name = username;
				
			let user = userId ? await usersManager.findUserById(userId) : await	usersManager.findUserByUsername(username);
			if (user) {
				userInfoDTO.id = user._id;
				userInfoDTO.name = user.name;
			}
			if (userInfoDTO.id)
				userInfoDTO.id = userInfoDTO.id.toString();
		
			usersInfosDTOs.push(userInfoDTO);
		}
		
		return usersInfosDTOs;
	}
	async function thingToThingDTO(accessThingUserClaims, thing, thingUserRights, pos) {
		
		if (!accessThingUserClaims)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "No Correct User's Thing Claims ", 31);
		
		let thingDTO = new ThingDTO();
		
		thingDTO.id = thing._id;
		// TODO: Insert Claims control?
		thingDTO.pos = pos;
		
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadCreationDate) != 0)
			thingDTO.creationDate = thing.creationDate;
		
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadName) != 0)
			thingDTO.name = thing.name;
		
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadKind) != 0)
			thingDTO.kind = thing.kind;
		
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadDeletedStatus) != 0)
		{
			thingDTO.deletedStatus = thing.deletedStatus;
			thingDTO.deletedDate = thing.deletedDate;
		}
		
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadPublicReadClaims) != 0)
			thingDTO.publicReadClaims = thing.publicReadClaims;
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadPublicChangeClaims) != 0)
			thingDTO.publicChangeClaims = thing.publicChangeClaims;
		
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadEveryoneReadClaims) != 0)
			thingDTO.everyoneReadClaims = thing.everyoneReadClaims;
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadEveryoneChangeClaims) != 0)
			thingDTO.everyoneChangeClaims = thing.everyoneChangeClaims;
		
		if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadValue) != 0)
			thingDTO.value = thing.value;
		
		if (thingUserRights && (accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadThingUserRights) != 0) {
			if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadThingUserStates) != 0)
				thingDTO.userStatus = thingUserRights.userStatus;
			
			if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadThingUserRole) != 0)
				thingDTO.userRole = thingUserRights.userRole;
		
			if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadThingUserVisibility) != 0)
				thingDTO.userVisibility = thingUserRights.userVisibility;
		
			if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadThingUserReadClaims) != 0)
				thingDTO.userReadClaims = thingUserRights.userReadClaims;
			if ((accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadThingUserChangeClaims) != 0)
				thingDTO.userChangeClaims = thingUserRights.userChangeClaims;

			// TODO: Insert Claims control? Is it useful? Test during shortPin implementation
			thingDTO.shortPin = thingUserRights.shortPin;
		}
		
		thingDTO.usersInfos = (accessThingUserClaims.read & thConstants.ThingUserReadClaims.CanReadThingUserRights) == 0 ? [] : await getUsersInfosAsync(thing);
		
		return thingDTO;
	}

	let loggedInThingUserClaims = getThingUserClaims(user, thing, isSuperAdministrator);

	let loggedInThingUserRights = {
		userRole : (isSuperAdministrator == true) ? thConstants.ThingUserRoles.Administrator : thConstants.ThingUserRoles.User,
		userStatus : thConstants.ThingUserStates.Ok,
		userVisibility : thConstants.ThingUserVisibility.Visible,
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
	let thingPos = thingPosition ? thingPosition.pos : thConstants.DefaultThingPos;

	return await thingToThingDTO(loggedInThingUserClaims, thing, loggedInThingUserRights, thingPos);
}

// User may be null because it is anonymous or it is a SuperAdministrator who has no relationship with Thing
export const getThing = async (user, thingId, deletedStatus) => {

	if (!thingId)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 47);

	// ToDo: Check why is used thConstants.ThingUserStates.WaitForAuth
	var thing = await _getThing(user, thingId, deletedStatus, thConstants.ThingUserRoles.NoMatter,
		user ? thConstants.ThingUserStates.Ok | thConstants.ThingUserStates.WaitForAuth : thConstants.ThingUserStates.NoMatter,
		thConstants.ThingUserVisibility.NoMatter);

	return await createThingDTO(user, null, thing, user.isSuperAdministrator);
};

export const getThings = async (user, parentThingId, thingFilter, valueFilter, orderBy, skip, top) => {

	let paging = utils.validateAndFixInputPaging(skip, top);

	return await _getThings(user, parentThingId, thingFilter, valueFilter, orderBy, paging.skip, paging.top);
};

export const createThing = async (user, thingDTO) => {

	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED,
			httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 13);
	
	// validate DTO
	if (!thingDTO)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_GATEWAY, "The body message is empty", 14);
	if (!thingDTO.kind)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Kind can't be empty", 15);
	if (!thingDTO.name)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Name can't be empty", 16);
	if (thConstants.validateThingDeletedStatus(thingDTO.deletedStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing DeletedStatus is incorrect", 17);
	if (thConstants.validateThingUserStatus(thingDTO.userStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 18);
	if (thConstants.validateThingUserRoles(thingDTO.userRole) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserRole is incorrect", 19);
	if (thConstants.validateThingUserVisibility(thingDTO.userVisibility) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserVisibility is incorrect", 35);

	if (thConstants.validateThingUserReadClaims(thingDTO.publicReadClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicReadClaims is incorrect", 82);
	if (thConstants.validateThingUserReadClaims(thingDTO.everyoneReadClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneReadClaims is incorrect", 83);
	if (thConstants.validateThingUserChangeClaims(thingDTO.publicChangeClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicChangeClaims is incorrect", 84);
	if (thConstants.validateThingUserChangeClaims(thingDTO.everyoneChangeClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneChangeClaimss is incorrect", 85);
	if (thConstants.validateThingUserReadClaims(thingDTO.userReadClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserReadClaims is incorrect", 86);
	if (thConstants.validateThingUserChangeClaims(thingDTO.userChangeClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserChangeClaims is incorrect", 87);
        
	// Generate Thing's Id if not provided
	let thingId = !thingDTO.id ? uuid() : thingDTO.id;
	
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
	thing.description = thingDTO.description;
	thing.value = thingDTO.value;
	thing.deletedStatus = thingDTO.deletedStatus;
	thing.deletedDate = thingDTO.deletedStatus == thConstants.ThingDeletedStates.Deleted ? Date.now : null;
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

	createThingPosition(user, null, thing, thConstants.DefaultThingPos);

	thingModel.save(thing);

	return {
		usersIdsToNotify : await getUsersIdsToNotify(thing),
		thingDTO : await createThingDTO(user, null, thing, false)
	};
};

export const updateThing = async (user, thingId, thingDTO) => {
	// TODO: It might be nice try clearing the two lines below and enable the function that anonymous users can change the Thing obviously by respecting Claims and Roles
	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 54);

	if (!thingId)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 55);

	var thing = await _getThing(user, thingId, thConstants.ThingDeletedStates.Ok, 
		thConstants.ThingUserRoles.Administrator, thConstants.ThingUserStates.Ok, thConstants.ThingUserVisibility.Visible);

	if (!thingDTO)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 56);

	let loggedInThingUserClaims = getThingUserClaims(user, thing, user.isSuperAdministrator);

	// We update the Thing

	let isChanged = false;

	if (thingDTO.name != null && thing.name != thingDTO.name) {

		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeName) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 57);

		if (!thingDTO.name)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Name can't be empty", 58);

		thing.name = thingDTO.name;
		isChanged = true;
	}
	if (thingDTO.kind != null && thing.kind != thingDTO.kind) {

		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeKind) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 59);
		
		if (!thingDTO.kind)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Kind can't be empty", 60);
		
		thing.kind = thingDTO.kind;
		isChanged = true;
	}
	if (thingDTO.description != null && thing.description != thingDTO.description) {
		
		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeDescription) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 101);
				
		thing.description = thingDTO.description;
		isChanged = true;
	}
	// Do not campare value value :-) because is an object
	if (thingDTO.value != null) {

		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeValue) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 61);

		thing.value = thingDTO.value;
		isChanged = true;
	}
	if (thingDTO.publicReadClaims != null && thing.publicReadClaims != thingDTO.publicReadClaims) {
		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangePublicReadClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 62);

		if (thConstants.validateThingUserReadClaims(thingDTO.publicReadClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicReadClaims is incorrect", 63);

		thing.publicReadClaims = thingDTO.publicReadClaims;
		isChanged = true;
	}
	if (thingDTO.publicChangeClaims != null && thing.publicChangeClaims != thingDTO.publicChangeClaims) {
		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangePublicChangeClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 64);

		if (thConstants.validateThingUserChangeClaims(thingDTO.publicChangeClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicChangeClaims is incorrect", 65);

		thing.publicChangeClaims = thingDTO.publicChangeClaims;
		isChanged = true;
	}
	if (thingDTO.everyoneReadClaims != null && thing.everyoneReadClaims != thingDTO.everyoneReadClaims) {
		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeEveryoneReadClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 66);

		if (thConstants.validateThingUserReadClaims(thingDTO.everyoneReadClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneReadClaims is incorrect", 67);

		thing.everyoneReadClaims = thingDTO.everyoneReadClaims;
		isChanged = true;
	}
	if (thingDTO.everyoneChangeClaims != null && thing.everyoneChangeClaims != thingDTO.everyoneChangeClaims) {
		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeEveryoneChangeClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 68);

		if (thConstants.validateThingUserChangeClaims(thingDTO.everyoneChangeClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneChangeClaims is incorrect", 69);

		thing.everyoneChangeClaims = thingDTO.everyoneChangeClaims;
		isChanged = true;
	}
	if (thingDTO.deletedStatus != null && thing.deletedStatus != thingDTO.deletedStatus) {
		if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeDeletedStatus) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 70);

		if (thConstants.validateThingDeletedStatus(thingDTO.deletedStatus) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneChangeClaims is incorrect", 81);

		thing.deletedStatus = thingDTO.deletedStatus;
		thing.deletedDate = Date.now();
		isChanged = true;
	}

	// I'm sure the User's status is OK because during Thing's access control I imposed that the User should be in OK status
	var thingUserRights = getThingUserRights(user._id, user.username, thing);
	// If user logged in does not have a relationship it means it is a SuperAdministrator
	if (thingUserRights) {
		if (thingDTO.userReadClaims != null && thingUserRights.userReadClaims != thingDTO.userReadClaims) {
			if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeThingUserReadClaims) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 78);

			if (thConstants.validateThingUserReadClaims(thingDTO.userReadClaims) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserReadClaims is incorrect", 71);

			thingUserRights.userReadClaims = thingDTO.userReadClaims;
			isChanged = true;
		}
		if (thingDTO.userRole != null && thingUserRights.userRole != thingDTO.userRole) {
			if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeThingUserRole) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 72);

			if (thConstants.validateThingUserRoles(thingDTO.userRole) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserRole is incorrect", 73);

			thingUserRights.userRole = thingDTO.userRole;
			isChanged = true;
		}
		if (thingDTO.userStatus != null && thingUserRights.userStatus != thingDTO.userStatus) {
			if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeThingUserStatus) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 74);

			if (thConstants.validateThingUserStatus(thingDTO.userStatus) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 75);

			thingUserRights.userStatus = thingDTO.userStatus;
			isChanged = true;
		}
		if (thingDTO.userVisibility != null && thingUserRights.userVisibility != thingDTO.userVisibility) {
			if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeThingUserVisibility) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 79);

			if (thConstants.validateThingUserVisibility(thingDTO.userVisibility) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 80);

			thingUserRights.userVisibility = thingDTO.userVisibility;
			isChanged = true;
		}

		// Must be last
		if (thingDTO.userChangeClaims != null && thingUserRights.userChangeClaims != thingDTO.userChangeClaims) {
			if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeThingUserChangeClaims) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 76);

			if (thConstants.validateThingUserChangeClaims(thingDTO.userChangeClaims) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserChangeClaims is incorrect", 77);

			thingUserRights.userChangeClaims = thingDTO.userChangeClaims;
			isChanged = true;
		}
	}

	let thingDTONew = await createThingDTO(user, null, thing, user.isSuperAdministrator);
	if (!thingDTONew)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "ThingDTO not created", 102);

	if (isChanged == false)
		return {
			thingDTO : thingDTONew,
			usersIdsToNotify : null,
			thingDTOs : null
		};

	let usersIdsToNotify = await getUsersIdsToNotify(thing);
	let thingDTOs = new Map();
	for (let userId of usersIdsToNotify) {
		let user = await usersManager.findUserById(userId);
		if (!user)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "User not found", 94);
		thingDTOs[user._id] = await createThingDTO(user, null, thing, user.isSuperAdministrator);
		if (!thingDTOs[user._id])
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "ThingDTO not created", 103);
	}

	thing.set(thingDTO);
	thingModel.save(thing);

	return {
		thingDTO : thingDTONew,
		usersIdsToNotify,
		thingDTOs
	};
};

export const updateThingValue = async (user, thingId, value, asCmd) => {

	if (!thingId)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 104);

	// ToDo: It might be nice try clearing the two lines below and enable the function that anonymous users can change the Thing obviously by respecting Claims and Roles
	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, "Unauthorized user", 105);

	var thing = await _getThing(user, thingId, thConstants.ThingDeletedStates.Ok, 
		thConstants.ThingUserRoles.NoMatter, thConstants.ThingUserStates.Ok, thConstants.ThingUserVisibility.Visible);

	var loggedInThingUserClaims = getThingUserClaims(user, thing);
	if ((loggedInThingUserClaims.change & thConstants.ThingUserChangeClaims.CanChangeValue) == 0)
		throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 106);

	// Do not compare value value :-) because it is an object
	if (value != null) {
		let usersIdsToNotify = await getUsersIdsToNotify(thing, true);

		if (asCmd == false) {
			if (typeof value !== "object")
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is not a valid JSON object", 132);
			thing.set({value});
			thingModel.save(thing);
		}

		return usersIdsToNotify;
	}

	return null;
};

