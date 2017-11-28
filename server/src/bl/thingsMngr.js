"use strict";

const httpStatusCodes = require("http-status-codes");
const uuidv4 = require("uuid/v4");

const utils = require("../utils");
const constants = require("../../../common/src/constants");
const UserInfoDTO = require("../../../common/src/dtos").UserInfoDTO;
const ThingDTO = require("../../../common/src/dtos").ThingDTO;
const usersManager = require("../bl/usersMngr");
const thingModel = require("../models/Thing");

function findThingById(id) { return thingModel.findThingById(id);}
function countThings(query) { return thingModel.countThings(query);}
function findThings(query, orderBy, skip, top) { return thingModel.findThings(query, orderBy, skip, top);}

// First search is by userId after it searchs by username
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

	let thingUserClaimsAndRights = {
		read    : thing.publicReadClaims,
		change  : thing.publicChangeClaims
	};

	if (user) {
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

function checkThingAccess(user, thing, deletedStatus, userRole, userStatus, userVisibility) {

	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing not valid", 36);

	if (deletedStatus != constants.ThingDeletedStates.NoMatter && thing.deletedStatus != deletedStatus)
		return false;

	if ((thing.publicReadClaims & constants.ThingUserReadClaims.AllClaims) != 0 || (thing.publicChangeClaims & constants.ThingUserChangeClaims.AllClaims) != 0)
	{
		if (!user && userRole == constants.ThingUserRole.NoMatter 
			&& userStatus == constants.ThingUserStates.NoMatter
			&& userVisibility == constants.ThingUserVisibility.NoMatter)
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
		if (userStatus != constants.ThingUserStates.NoMatter && ((thingUserRights.userStatus & userStatus) == 0))
			return false;

		if (userRole != constants.ThingUserRole.NoMatter && ((thingUserRights.userRole & userRole) == 0))
			return false;

		if (userVisibility != constants.ThingUserVisibility.NoMatter && ((thingUserRights.userVisibility & userVisibility) == 0))
			return false;
	}

	if ((thing.everyoneReadClaims & constants.ThingUserReadClaims.AllClaims) != 0 || (thing.everyoneChangeClaims & constants.ThingUserChangeClaims.AllClaims) != 0)
		return true;

	// If the User has no relationship with Thing does not pass
	if (!thingUserRights)
		return false;

	if (userStatus != constants.ThingUserStates.NoMatter && ((thingUserRights.userStatus & userStatus) == 0))
		return false;

	if (userRole != constants.ThingUserRole.NoMatter && ((thingUserRights.userRole & userRole) == 0))
		return false;

	if (userVisibility != constants.ThingUserVisibility.NoMatter && ((thingUserRights.userVisibility & userVisibility) == 0))
		return false;

	return true;
}

// Not optimized using the CheckThingAccess function.
// It does not get optimized because staying so you have a capillary control of where it eventually snaps the error
async function getThing(user, thingId, deletedStatus, userRole, userStatus, userVisibility) {

	if (!thingId)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id not valid", 37);

	let thing = await findThingById(thingId);
	if (!thing)
	{
		// Returns httpStatusCodes.Unauthorized to Reset Some Malicious Logon Access
		if (!user)
			throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, "Unauthorized user", 38);
		throw new utils.ErrorCustom(httpStatusCodes.NOT_FOUND, "Thing not found", 39);
	}

	if (deletedStatus != constants.ThingDeletedStates.NoMatter && thing.deletedStatus != deletedStatus)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Deletedstatus not valid", 40);

	if ((thing.publicReadClaims & constants.ThingUserReadClaims.AllClaims) != 0 
		|| (thing.publicChangeClaims & constants.ThingUserChangeClaims.AllClaims) != 0)
	{
		// This is a condition I do not remember why it was put on. I consider it important.
		// At this time it is commented why when I try to assign a pos to Thing
		// for an unnamed user who does not have a relationship with Thing the condition does not let me pass.
		// if (user == null && userRole == ThingUserRole.NoMatter && userStatus == ThingUserStates.NoMatter && userVisibility == constants.ThingUserVisibility.NoMatter)
		return thing;
	}

	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, "Unauthorized user", 41);

	// If User is Super Administrator returns Thing whatever filters(userRole) are passed as parameters
	if (user.isSuperAdministrator)
		return thing;

	if ((thing.everyoneReadClaims & constants.ThingUserReadClaims.AllClaims) != 0 
		|| (thing.everyoneChangeClaims & constants.ThingUserChangeClaims.AllClaims) != 0)
		return thing;

	var thingUserRights = getThingUserRights(user._id, user.username, thing);
	if (thingUserRights)
	{
		if (userStatus != constants.ThingUserStates.NoMatter && ((thingUserRights.userStatus & userStatus) == 0))
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 42);

		if (userRole != constants.ThingUserRole.NoMatter && ((thingUserRights.userRole & userRole) == 0))
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 43);

		if (userVisibility != constants.ThingUserVisibility.NoMatter && ((thingUserRights.userVisibility & userVisibility) == 0))
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 48);

		return thing;
	}

	throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 44);
}

async function getThings(user, parentThingId, thingFilter, valueFilter, orderBy, skip, top) {

	let paging = utils.validateAndFixInputPaging(skip, top);

	skip = paging.skip;
	top = paging.top;

	let mainThingsQuery = {};

	mainThingsQuery["$and"] = [];

	let publicEveryoneUserQuery = {};

	if (!user) {

		publicEveryoneUserQuery["$or"] = [];
		
		publicEveryoneUserQuery["$or"].push({publicReadClaims: { $bitsAnySet: constants.ThingUserReadClaims.AllClaims }});
		publicEveryoneUserQuery["$or"].push({publicChangeClaims: { $bitsAnySet: constants.ThingUserChangeClaims.AllClaims }});
	}

	if (user && !user.isSuperAdministrator)	{

		publicEveryoneUserQuery["$or"] = [];

		publicEveryoneUserQuery["$or"].push({publicReadClaims: { $bitsAnySet: constants.ThingUserReadClaims.AllClaims }});
		publicEveryoneUserQuery["$or"].push({publicChangeClaims: { $bitsAnySet: constants.ThingUserChangeClaims.AllClaims }});

		publicEveryoneUserQuery["$or"].push({everyoneReadClaims: { $bitsAnySet: constants.ThingUserReadClaims.AllClaims }});
		publicEveryoneUserQuery["$or"].push({everyoneChangeClaims: { $bitsAnySet: constants.ThingUserChangeClaims.AllClaims }});

		let userRightsQuery = {};
		userRightsQuery["$and"] = [];

		let userIdUsernameQuery = {};
		userIdUsernameQuery["$or"] = [];
		userIdUsernameQuery["$or"].push({"usersRights.userId": user._id });
		userIdUsernameQuery["$or"].push({"usersRights.username": user.username });

		userRightsQuery["$and"].push(userIdUsernameQuery);

		let userStatusVisibilityQuery = {};
		userStatusVisibilityQuery["$and"] = [];
		userStatusVisibilityQuery["$and"].push({"usersRights.userStatus": {$bitsAnySet: (constants.ThingUserStates.Ok | constants.ThingUserStates.WaitForAuth) }});
		userStatusVisibilityQuery["$and"].push({"usersRights.userVisibility": {$bitsAnySet: constants.ThingUserVisibility.Visible }});
		
		userRightsQuery["$and"].push(userStatusVisibilityQuery);

		publicEveryoneUserQuery["$or"].push(userRightsQuery);
	}

	mainThingsQuery["$and"].push(publicEveryoneUserQuery);

	let parentThing = null;
	if (parentThingId) {
		
		parentThing = await getThing(user, parentThingId, constants.ThingDeletedStates.Ok, 
			constants.ThingUserRole.NoMatter, constants.ThingUserStates.Ok, constants.ThingUserVisibility.Visible);

		mainThingsQuery["$and"].push({parentsThingsIds: { $elemMatch: {userId: user ? user._id : null, parentThingId }}} );
	}

	if (thingFilter)
		mainThingsQuery["$and"].push(thingFilter);	

	if (valueFilter)
		mainThingsQuery["$and"].push(valueFilter);

	let totalItems =  await countThings(mainThingsQuery);

	if (skip >= totalItems)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Skip param is not valid",53);

	if (skip + top > totalItems)
		top = totalItems - skip;

	let order = orderBy ? orderBy : { "parentsThingsIds.pos": 1 };

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
		// TODO: Insert Claims control?
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
		
		if (thingUserRights && (accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserRights) != 0) {
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserStates) != 0)
				thingDTO.userStatus = thingUserRights.userStatus;
			
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserRole) != 0)
				thingDTO.userRole = thingUserRights.userRole;
		
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserVisibility) != 0)
				thingDTO.userVisibility = thingUserRights.userVisibility;
		
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserReadClaims) != 0)
				thingDTO.userReadClaims = thingUserRights.userReadClaims;
			if ((accessThingUserClaims.read & constants.ThingUserReadClaims.CanReadThingUserChangeClaims) != 0)
				thingDTO.userChangeClaims = thingUserRights.userChangeClaims;

			// TODO: Insert Claims control? Is it useful? Test during shortPin implementation
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

// User may be null because it is anonymous or it is a SuperAdministrator who has no relationship with Thing
exports.getThing = async (user, thingId, deletedStatus) => {

	if (!thingId)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 47);

	var thing = await getThing(user, thingId, deletedStatus, constants.ThingUserRole.NoMatter,
		user ? constants.ThingUserStates.Ok | constants.ThingUserStates.WaitForAuth : constants.ThingUserStates.NoMatter,
		constants.ThingUserVisibility.NoMatter);

	return await createThingDTO(user, null, thing, user.isSuperAdministrator);
};

exports.getThings = async (user, parentThingId, thingFilter, valueFilter, orderBy, skip, top) => {

	let paging = utils.validateAndFixInputPaging(skip, top);

	return await getThings(user, parentThingId, thingFilter, valueFilter, orderBy, paging.skip, paging.top);
};

exports.createThing = async (user, thingDTO) => {

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
	if (constants.validateThingDeletedStates(thingDTO.deletedStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing DeletedStatus is incorrect", 17);
	if (constants.validateThingUserStatus(thingDTO.userStatus) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 18);
	if (constants.validateThingUserRole(thingDTO.userRole) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserRole is incorrect", 19);
	if (constants.validateThingUserVisibility(thingDTO.userVisibility) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserVisibility is incorrect", 35);

	if (constants.validateThingUserReadClaims(thingDTO.publicReadClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicReadClaims is incorrect", 82);
	if (constants.validateThingUserReadClaims(thingDTO.everyoneReadClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneReadClaims is incorrect", 83);
	if (constants.validateThingUserChangeClaims(thingDTO.publicChangeClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicChangeClaims is incorrect", 84);
	if (constants.validateThingUserChangeClaims(thingDTO.everyoneChangeClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneChangeClaimss is incorrect", 85);
	if (constants.validateThingUserReadClaims(thingDTO.userReadClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserReadClaims is incorrect", 86);
	if (constants.validateThingUserChangeClaims(thingDTO.userChangeClaims) == false)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserChangeClaims is incorrect", 87);
        
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

exports.updateThing = async (user, thingId, thingDTO) => {
	// TODO: It might be nice try clearing the two lines below and enable the function that anonymous users can change the Thing obviously by respecting Claims and Roles
	if (!user)
		throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 54);

	if (!thingId)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 55);

	var thing = await getThing(user, thingId, constants.ThingDeletedStates.Ok, 
		constants.ThingUserRole.Administrator, constants.ThingUserStates.Ok, constants.ThingUserVisibility.Visible);

	// Validation is not used because you need to control access to the various Thing properties
	//validateThingDTO(constants, thingDTO);

	if (!thingDTO)
		throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 56);

	let loggedInThingUserClaims = getThingUserClaims(user, thing, user.isSuperAdministrator);

	// We update the Thing

	let isChanged = false;

	if (thingDTO.name != undefined && thing.name != thingDTO.name) {

		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeName) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 57);

		if (!thingDTO.name)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Name can't be empty", 58);

		thing.name = thingDTO.name;
		isChanged = true;
	}
	if (thingDTO.kind != undefined && thing.kind != thingDTO.kind) {

		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeKind) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "Unauthorized user", 59);
		
		if (!thingDTO.kind)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Kind can't be empty", 60);
		
		thing.kind = thingDTO.kind;
		isChanged = true;
	}
	if (thingDTO.value != undefined && thing.value != thingDTO.value) {

		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeValue) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 61);

		thing.value = thingDTO.value;
		isChanged = true;
	}
	if (thingDTO.publicReadClaims != undefined && thing.publicReadClaims != thingDTO.publicReadClaims) {
		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangePublicReadClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 62);

		if (constants.validateThingUserReadClaims(thingDTO.publicReadClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicReadClaims is incorrect", 63);

		thing.publicReadClaims = thingDTO.publicReadClaims;
		isChanged = true;
	}
	if (thingDTO.publicChangeClaims != undefined && thing.publicChangeClaims != thingDTO.publicChangeClaims) {
		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangePublicChangeClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 64);

		if (constants.validateThingUserChangeClaims(thingDTO.publicChangeClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing PublicChangeClaims is incorrect", 65);

		thing.publicChangeClaims = thingDTO.publicChangeClaims;
		isChanged = true;
	}
	if (thingDTO.everyoneReadClaims != undefined && thing.everyoneReadClaims != thingDTO.everyoneReadClaims) {
		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeEveryoneReadClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 66);

		if (constants.validateThingUserReadClaims(thingDTO.everyoneReadClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneReadClaims is incorrect", 67);

		thing.everyoneReadClaims = thingDTO.everyoneReadClaims;
		isChanged = true;
	}
	if (thingDTO.everyoneChangeClaims != undefined && thing.everyoneChangeClaims != thingDTO.everyoneChangeClaims) {
		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeEveryoneChangeClaims) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 68);

		if (constants.validateThingUserChangeClaims(thingDTO.everyoneChangeClaims) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneChangeClaims is incorrect", 69);

		thing.everyoneChangeClaims = thingDTO.everyoneChangeClaims;
		isChanged = true;
	}
	if (thingDTO.deletedStatus != undefined && thing.deletedStatus != thingDTO.deletedStatus) {
		if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeDeletedStatus) == 0)
			throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 70);

		if (constants.validateThingDeletedStatus(thingDTO.deletedStatus) == false)
			throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing EveryoneChangeClaims is incorrect", 81);

		thing.deletedStatus = thingDTO.deletedStatus;
		thing.deletedDate = Date.now();
		isChanged = true;
	}

	// I'm sure the User's status is OK because during Thing's access control I imposed that the User should be in OK status
	var thingUserRights = getThingUserRights(user._id, user.username, thing);
	// If user logged in does not have a relationship it means it is a SuperAdministrator
	if (thingUserRights) {
		if (thingDTO.userReadClaims != undefined && thingUserRights.userReadClaims != thingDTO.userReadClaims) {
			if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeThingUserReadClaims) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 78);

			if (constants.validateThingUserReadClaims(thingDTO.userReadClaims) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserReadClaims is incorrect", 71);

			thingUserRights.userReadClaims = thingDTO.userReadClaims;
			isChanged = true;
		}
		if (thingDTO.userRole != undefined && thingUserRights.userRole != thingDTO.userRole) {
			if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeThingUserRole) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 72);

			if (constants.validateThingUserRole(thingDTO.userRole) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserRole is incorrect", 73);

			thingUserRights.userRole = thingDTO.userRole;
			isChanged = true;
		}
		if (thingDTO.userStatus != undefined && thingUserRights.userStatus != thingDTO.userStatus) {
			if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeThingUserStatus) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 74);

			if (constants.validateThingUserStatus(thingDTO.userStatus) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 75);

			thingUserRights.userStatus = thingDTO.userStatus;
			isChanged = true;
		}
		if (thingDTO.userVisibility != undefined && thingUserRights.userVisibility != thingDTO.userVisibility) {
			if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeThingUserVisibility) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 79);

			if (constants.validateThingUserVisibility(thingDTO.userVisibility) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserStatus is incorrect", 80);

			thingUserRights.userVisibility = thingDTO.userVisibility;
			isChanged = true;
		}

		// Must be last
		if (thingDTO.userChangeClaims != undefined && thingUserRights.userChangeClaims != thingDTO.userChangeClaims) {
			if ((loggedInThingUserClaims.change & constants.ThingUserChangeClaims.CanChangeThingUserChangeClaims) == 0)
				throw new utils.ErrorCustom(httpStatusCodes.FORBIDDEN, "User can not changes Thing's properties", 76);

			if (constants.validateThingUserChangeClaims(thingDTO.userChangeClaims) == false)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing UserChangeClaims is incorrect", 77);

			thingUserRights.userChangeClaims = thingDTO.userChangeClaims;
			isChanged = true;
		}
	}

	if (isChanged == false)
		return {
			thingDTO : await createThingDTO(user, null, thing, user.isSuperAdministrator),
			usersIdsToNotify : null,
			thingDTOs : null
		};

	thing.set(thingDTO);
	thingModel.save(thing);

	let usersIdsToNotify = await getUsersIdsToNotify(thing);
	let thingDTOs = new Map();
	for (let userId of usersIdsToNotify) {
		let user = await usersManager.findUserById(userId);
		if (!user)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "User not found", 94);
		thingDTOs[user._id] = await createThingDTO(user, null, thing, user.isSuperAdministrator);
	}

	return {
		thingDTO : await createThingDTO(user, null, thing, user.isSuperAdministrator),
		usersIdsToNotify,
		thingDTOs
	};
};

