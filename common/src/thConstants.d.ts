export declare const enum ThingDeletedStates {
	NoMatter  = 0,  // Interna state. Do not useful for external usage
	Ok        = 1,
	Deleted   = 2
}
export function validateThingDeletedStatus(deletedStatus) : boolean;

// The User can not have more Roles in the same time
export declare const enum ThingUserRoles {
	NoMatter      = 0,  // Internal state. Do not use for external use like filter
	Administrator = 1,
	User          = 2
}
export function validateThingUserRoles(userRole) : boolean;
// The User can not have more Status at same time
export declare const enum ThingUserStates {
	NoMatter    = 0,  // Internal state. Do not use for external use like filter
	Ok          = 1,
	WaitForAuth = 2,
	Deleted     = 4
}
export function validateThingUserStatus(userStatus) : boolean;

export declare const enum ThingUserVisibility {
	NoMatter  = 0,  // Internal state. Do not use for external use like filter
	Visible       = 1,
	Hidden        = 2
}
export declare function validateThingUserVisibility(visibility) : boolean;

// Do not have validation function since are bitwise values

export declare const enum ThingUserReadClaims {

	NoClaims = 0,

	CanReadCreationDate= 2,
	CanReadName= 4,
	CanReadDescription= 8,
	CanReadKind= 16,
	CanReadValue= 32,
	CanReadDeletedStatus= 64,

	CanReadPublicReadClaims= 2048,
	CanReadPublicChangeClaims= 4096,
	CanReadEveryoneReadClaims= 8192,
	CanReadEveryoneChangeClaims= 16384,

	CanReadThingUserRights= 128,
	CanReadThingUserRole= 256,
	CanReadThingUserStatus= 512,
	CanReadThingUserVisibility= 32768,

	CanReadThingUserReadClaims= 1024,
	CanReadThingUserChangeClaims = 1,

	AllClaims = 65535
}
// ShortCut
// INFO: Max int value 0x7FFFFFFF;//2147483647 - 32 bit with sign. Javascript bit manipulation limit
/* ThingUserReadClaims.AllClaims = ThingUserReadClaims.CanReadThingUserChangeClaims |
ThingUserReadClaims.CanReadCreationDate | ThingUserReadClaims.CanReadName | ThingUserReadClaims.CanReadDescription |
ThingUserReadClaims.CanReadKind | ThingUserReadClaims.CanReadValue | ThingUserReadClaims.CanReadDeletedStatus |
ThingUserReadClaims.CanReadThingUserRights | ThingUserReadClaims.CanReadThingUserRole | ThingUserReadClaims.CanReadThingUserVisibility |
ThingUserReadClaims.CanReadThingUserStatus | ThingUserReadClaims.CanReadThingUserReadClaims | ThingUserReadClaims.CanReadPublicReadClaims |
ThingUserReadClaims.CanReadPublicChangeClaims | ThingUserReadClaims.CanReadEveryoneReadClaims | ThingUserReadClaims.CanReadEveryoneChangeClaims; */

export function validateThingUserReadClaims(userReadClaims) : boolean;
// Do not have validation function since are bitwise values
export declare const enum ThingUserChangeClaims {
	NoClaims = 0,

	CanDeleteThing= 1,
	CanChangeName= 2,
	CanChangeDescription= 4,
	CanChangeKind= 8,
	CanChangeValue= 16,
	CanChangeDeletedStatus= 32,

	CanChangePublicReadClaims= 4096,
	CanChangePublicChangeClaims= 8192,
	CanChangeEveryoneReadClaims= 16384,
	CanChangeEveryoneChangeClaims= 32768,

	CanAddThingUserRights= 64,
	CanDeleteThingUserRights= 128,

	CanChangeThingUserRole= 256,
	CanChangeThingUserStatus= 512,
	CanChangeThingUserVisibility= 524288,

	CanChangeThingUserReadClaims= 1024,
	CanChangeThingUserChangeClaims= 2048,

	CanAddChildrenThing= 65536,
	CanRemoveChildrenThing= 131072,

	// In beta test
	CanOtherUsersChangeMyThingPos= 262144,

	AllClaims = 524287
}
// ShortCut
// INFO: Max int value 0x7FFFFFFF;//2147483647 - 32 bit with sign. Javascript bit manipulation limit
/* ThingUserChangeClaims.AllClaims = ThingUserChangeClaims.CanDeleteThing | ThingUserChangeClaims.CanChangeName | ThingUserChangeClaims.CanChangeDescription |
ThingUserChangeClaims.CanChangeKind | ThingUserChangeClaims.CanChangeValue | ThingUserChangeClaims.CanChangeDeletedStatus |
ThingUserChangeClaims.CanAddThingUserRights | ThingUserChangeClaims.CanDeleteThingUserRights | ThingUserChangeClaims.CanChangeThingUserRole | ThingUserChangeClaims.CanChangeThingUserVisibility |
ThingUserChangeClaims.CanChangeThingUserStatus | ThingUserChangeClaims.CanChangeThingUserReadClaims | ThingUserChangeClaims.CanChangeThingUserChangeClaims |
ThingUserChangeClaims.CanChangePublicReadClaims | ThingUserChangeClaims.CanChangePublicChangeClaims | ThingUserChangeClaims.CanChangeEveryoneReadClaims | ThingUserChangeClaims.CanChangeEveryoneChangeClaims |
ThingUserChangeClaims.CanAddChildrenThing | ThingUserChangeClaims.CanRemoveChildrenThing;
 */

export function validateThingUserChangeClaims(userChangeClaims) : boolean;

export declare const enum ThingKind {
	NoMatter= "0",
	genericId = "1",
	genericTxt = "the bees are laborious"
}

export declare const DefaultThingPos : Number;


