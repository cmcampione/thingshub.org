export declare const enum ThingDeletedStates {
	NoMatter  = 0,  // Interna state. Do not useful for external usage
	Ok        = 1,
	Deleted   = 2
}
export function validateThingDeletedStatus(deletedStatus) : boolean;
export declare const enum ThingUserRoles {
	NoMatter      = 0,  // Internal state. Do not use for external use like filter
	Administrator = 1,
	User          = 2
}
export function validateThingUserRoles(userRole) : boolean;
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
export function validateThingUserReadClaims(userReadClaims) : boolean;
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
export function validateThingUserChangeClaims(userChangeClaims) : boolean;
export declare const enum ThingKind {
	NoMatter= "0",
	genericId = "1",
	genericTxt = "the bees are laborious"
}
export declare const DefaultThingPos : Number;
export declare const enum RegisterByOnlyEmailStatus {
	UserAlreadyRegistered = 1,
	ConfirmPendingEmailSent = 2
}
export declare class RegisterByOnlyEmailDTO {
	public email : string;
	public confirmationToken: string;
	public status : any;

	constructor(email, confirmationToken, status);
}
export declare class EmailDTO {
	public value : string;
	public isConfirmed :  boolean;
	constructor(email);
}
export declare class UserDTO { 
	public id : string;
	public name : string;
	public username : string;
	public emails : EmailDTO[];
	public masterApiKey : string;

	constructor(user, fullInfos);
}
export declare class UserInfoDTO {
	public id : string;
	public name : string;
	constructor();
}
export declare class ThingDTO {
	public id : string;
	
	public creationDate : Date;
	
	public name : string;
	
	public kind : string;
	
	public pos : number;// Not used during creation or updating of thing
	
	public deletedStatus : ThingDeletedStates;
	public deletedDate  : Date;
	
	public publicReadClaims : ThingUserReadClaims;
	public publicChangeClaims : ThingUserChangeClaims;
	
	public everyoneReadClaims : ThingUserReadClaims;
	public everyoneChangeClaims : ThingUserChangeClaims;
	
	public value : any;
	
	public userStatus : ThingUserStates;
	public userRole : ThingUserRoles;
	public userVisibility : ThingUserVisibility;
	
	public userReadClaims : ThingUserReadClaims;
	public userChangeClaims : ThingUserChangeClaims;
	
	public usersInfos : UserInfoDTO[];
}
export declare const enum ConnectionStates {
	Connecting = 0,
	Connected = 1,
	Reconnecting = 2,
	Disconnected = 4,
}
export declare class Connector {
	protected connectionStatus: ConnectionStates;
	protected url: string;
	protected authHook: () => void;
	protected errorHook: (error: any) => void;
	protected stateChangedHook: (newState: ConnectionStates) => void;
	protected connectErrorHook: (error: any) => void;
	protected on_connectionStatusChange(newState: ConnectionStates): void;
	subscribe(): void;
	unsubscribe(): void;
	setHook(eventName: string, hook: (...msg: any[]) => void): void;
	remHook(eventName: any, hook: (...msg: any[]) => void): void;
	constructor(url: string, authHook: () => void, errorHook: (error) => void, connectErrorHook: (error) => void, stateChangedHook: (change: ConnectionStates) => void);
	api(): Promise<any | any>;
}
export declare class SocketIOConnector extends Connector {
	private socket;
	constructor(url: string, authHook: () => void, errorHook: (error) => void, connectErrorHook: (error) => void, stateChangedHook: (change: ConnectionStates) => void);
	private on_error(error);
	private on_connect_error(error);
	private on_connect();
	private on_disconnect(reason);
	subscribe(): void;
	unsubscribe(): void;
	setHook(eventName: string, hook: (...msg: any[]) => void): void;
	remHook(eventName: any, hook: (...msg: any[]) => void): void;
}
export interface ItemsRange {
	skip: number;
	top: number;
	totalItems: number;
}
export declare class HttpRequestCanceler {
	cancelerToken: any;
	executor: any;
	setup(): void;
	reset(): void;
	cancel(): void;
}
export declare type HttpFailResult = any;
export declare class Helpers {
	static getRangeItemsFromResponse(response: any): ItemsRange;
}
export interface EndPointAddress {
	server: string;
	api: string;
}
export declare class AccountDataContext {
	private securityHeaderHook;
	private accountUrl;
	constructor(endPointAddress: EndPointAddress, securityHeaderHook: () => object);
	login(username: string, password: string): Promise<any | HttpFailResult>;
	loginBasic(username: string, password: string): Promise<any | HttpFailResult>;
	logout(): Promise<any | HttpFailResult>;
}
export declare class AccountManager {
	private accountDataContext;
	private _appName;
	private _accessToken;
	private _userId;
	private _userName;
	private _apiKey;
	private resetLoginData();
	private setLoginData(loginData, remember);
	private readLoginData();
	constructor(appName: string, accountDataContext: AccountDataContext);
	apiKey: string;
	readonly accessToken: string;
	readonly isLoggedIn: boolean;
	login(username: string, password: string, remember: boolean): Promise<any>;
	logout(): Promise<any>;
}
export declare type UserInfo = any;
export declare class Thing {
	childrenSkip: number;
	childrenTotalItems: number;
	children: Thing[];
	id: string;
	creationDateTime: Date;
	name: string;
	kind: string;
	pos: number;
	deletedStatus: ThingDeletedStates;
	deletedDateTime: Date;
	publicReadClaims: ThingUserReadClaims;
	publicChangeClaims: ThingUserChangeClaims;
	everyoneReadClaims: ThingUserReadClaims;
	everyoneChangeClaims: ThingUserChangeClaims;
	userStatus: ThingUserStates;
	userRole: ThingUserRoles;
	userVisibility: ThingUserVisibility;
	userReadClaims: ThingUserReadClaims;
	userChangeClaims: ThingUserChangeClaims;
	usersInfos: UserInfo[];
	value: any;
	constructor(thingDTO?: ThingDTO);
	addThingChild(thingChildDTO: ThingDTO): void;
	collapse(): void;
	shallowCopy(): Thing;
}
export declare type ThingPositionRaw = any;
export interface ThingsGetParams {
	parentThingId: string;
	thingFilter: string;
	valueFilter: string;
	orderBy: string;
	skip: number;
	top: number;
}
export interface ThingsDTOsDataSet {
	things: ThingDTO[];
	itemsRange: ItemsRange;
}
export declare class ThingsDataContext {
	private apiEndPointAddress;
	private securityHeaderHook;
	private thingsUrl(thingId?);
	private thingsValueUrl(thingId);
	private thingsPositionsUrl();
	private thingChildrenUrl(parentThingId, childrenId?);
	private thingDeleteChildUrl(parentThingId, childThingId);
	constructor(endPointAddress: EndPointAddress, securityHeaderHook: () => object);
	getThing(thingId: string): Promise<ThingDTO | HttpFailResult>;
	getThings(parameter: ThingsGetParams, canceler?: HttpRequestCanceler): Promise<ThingsDTOsDataSet | HttpFailResult>;
	createThing(ThingDTO: ThingDTO): Promise<ThingDTO | HttpFailResult>;
	updateThing(thingId: string, ThingDTO: ThingDTO): Promise<ThingDTO | HttpFailResult>;
	deleteThing(thingId: string): Promise<any | HttpFailResult>;
	getThingChildrenIds(parentThingId: string): Promise<string[] | HttpFailResult>;
	addChildToParent(parentThingId: string, childThingId: string): Promise<any | HttpFailResult>;
	deleteThingChild(parentThingId: string, childThingId: string): Promise<any | HttpFailResult>;
	getThingValue(thingId: string, value: any): Promise<any | HttpFailResult>;
	putThingValue(thingId: string, value: any): Promise<any | HttpFailResult>;
	putThingsPositions(positions: ThingPositionRaw[]): Promise<any | HttpFailResult>;
}

export as namespace thingshub;
