"use strict";

const httpStatusCodes = require("http-status-codes");
const uuidv4 = require("uuid/v4");

const utils = require("../utils");
const constants = require("../sharedConst");
const usersManager = require("../bl/usersMngr");
const thingModel = require("../models/Thing");

function findThingById(id) { return thingModel.findThingById(id);}

 // First search for userId if it does not find it by username
 function getThingUserRights(userId, username, thing)
 {
	if (!userId && !username)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "userId or usernane must be not empty", 28);

	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 27);

	 let thingUserRights = null;            

	 if (userId)
		 thingUserRights = thing.usersRights.FirstOrDefault(u => u.AppUserId == userId);
	 if (thingUserRights == null && username)
		 thingUserRights = thing.usersRights.FirstOrDefault(u => u.Username == username);

	 return thingUserRights;
 }

// All paths return to something. It never returns null except for exceptions
// The User may be null as anonymous. If User is anonymous returns Thing's PublicClaims
function getThingUserClaims(user, thing, isSuperAdministrator)
{
	if (!thing)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 26);

	thingUserClaimsAndRights = 
	{
		read    : thing.publicReadClaims,
		change  : thing.publicChangeClaims
	}

	if (user != null)
	{
		thingUserClaimsAndRights.read   = thingUserClaimsAndRights.read   | thing.everyoneReadClaims;
		thingUserClaimsAndRights.change = thingUserClaimsAndRights.change | thing.everyoneChangeClaims;

		var thingUserRights = getThingUserRights(user.id, user.userName, thing);
		if (thingUserRights != null)
		{
			thingUserClaimsAndRights.read   = thingUserClaimsAndRights.read   | thingUserRights.userReadClaims;
			thingUserClaimsAndRights.change = thingUserClaimsAndRights.change | thingUserRights.userChangeClaims;
		}

		if (isSuperAdministrator == true)
		{
			thingUserClaimsAndRights.read   = ThingUserReadClaims.AllClaims;
			thingUserClaimsAndRights.change = ThingUserChangeClaims.AllClaims;
		}
	}

	return thingUserClaimsAndRights;
}

function createThingPosition(user, parentThing, childThing, pos){
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

// Lo User potrebbe essere null perchè è anonimo o è un SuperAdministrator che non ha alcuna relazione con la Thing
async function createThingDTOAsync(user, parentThings, thing, isSuperAdministrator)
{
	var loggedInThingUserClaims = GetThingUserClaimsOpt(user, thing, isSuperAdministrator);

	ThingUserRights loggedInThingUserRights = new ThingUserRights()
	{
		AppUser = null, //In questo contesto non viene utilizzata
		AppUserId = null, //In questo contesto non viene utilizzata
		Thing = null, //In questo contesto non viene utilizzata
		ThingId = null, //In questo contesto non viene utilizzata

		UserRole = (isSuperAdministrator == true) ? ThingUserRole.Administrator : ThingUserRole.User,
		UserStatus = ThingUserStatus.Ok,
		ThingVisibility = ThingUserVisibility.Visible,
		UserReadClaims = loggedInThingUserClaims.Read,
		UserChangeClaims = loggedInThingUserClaims.Change,
		ShortPin = 0
	};

	if (user != null)
	{
		var loggedInThingUserRights1 = GetThingUserRights(user.Id, user.UserName, thing);
		if (loggedInThingUserRights1 != null)
		{
			loggedInThingUserRights.UserRole = loggedInThingUserRights1.UserRole;
			loggedInThingUserRights.UserStatus = loggedInThingUserRights1.UserStatus;
			loggedInThingUserRights.ThingVisibility = loggedInThingUserRights1.ThingVisibility;
			loggedInThingUserRights.ShortPin = loggedInThingUserRights1.ShortPin;
			loggedInThingUserRights.UserReadClaims = loggedInThingUserRights1.UserReadClaims;
			loggedInThingUserRights.UserChangeClaims = loggedInThingUserRights1.UserChangeClaims;
		}
	}

	var thingPosition = GetThingPosition(user, parentThings, thing);
	int thingPos = thingPosition != null ? thingPosition.Position : int.MaxValue;

	var thingDTO = MappingHelper.ToThingDTO(loggedInThingUserClaims, thing, loggedInThingUserRights, thingPos, commonTable);

	//TODO: Spostare in MappingHelper.ToThingDTO
	thingDTO.UsersInfos = (loggedInThingUserClaims.Read & ThingUserReadClaims.CanReadThingUserRights) == 0 ? null : await GetUsersInfosAsync(thing);

	return thingDTO;
}

// Prepara le notifiche per gli User che hanno una relazione con la Thing che comunque siano nello stato Ok o WaitForAuth e che siano realmente registrati (Non utenti "free". I Notificator non potrebbero notificare)
async function createGenericBLResult(thing) {
	if (thing == null)
		throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Thing can't be null", 26);

	let UsersIdsToNotify = new Set();

	for(let r of thing.usersRights) {
		if (r.userId && ((r.userStatus & (constants.ThingUserStatus.Ok | constants.ThingUserStatus.WaitForAuth)) != 0))
		{
			UsersIdsToNotify.add(r.userId);
			continue;
		}
		if (!r.username)
			throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "ThingUserRights without userId and username can't exist", 27);
	
		let user = usersManager.findUserByUsername(r.username)
		if (!user)
			continue;
		
		UsersIdsToNotify.add(user._id);
	}

}

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
	let thingId = !thingDTO.Id ? uuidv4() : thingDTO.Id;
	
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
		userId : user.id,
		username: user.username,
		userRole: thingDTO.userRole,
		userStatus: thingDTO.userStatus,
		thingVisibility: thingDTO.thingVisibility,
		userReadClaims: thingDTO.userReadClaims,
		userChangeClaims: thingDTO.userChangeClaims,
		shortPin: thingDTO.shortPin
	});

	let defaultThingPos = Number.MAX_SAFE_INTEGER;

	createThingPosition(user, null, thing, defaultThingPos);

	createGenericBLResult

	return {
		pos: defaultThingPos, 
		thing
	};
};