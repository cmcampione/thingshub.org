// Generated by dts-bundle-generator v6.3.0

import { CancelToken } from 'axios';

export declare const enum ThingDeletedStates {
	NoMatter = 0,
	Ok = 1,
	Deleted = 2
}
export function validateThingDeletedStatus(deletedStatus: any): boolean;
export declare const enum ThingUserRoles {
	NoMatter = 0,
	Administrator = 1,
	User = 2
}
export function validateThingUserRoles(userRole: any): boolean;
export declare const enum ThingUserStates {
	NoMatter = 0,
	Ok = 1,
	WaitForAuth = 2,
	Deleted = 4
}
export function validateThingUserStatus(userStatus: any): boolean;
export declare const enum ThingUserVisibility {
	NoMatter = 0,
	Visible = 1,
	Hidden = 2
}
export declare function validateThingUserVisibility(visibility: any): boolean;
export declare const enum ThingUserReadClaims {
	NoClaims = 0,
	CanReadCreationDate = 2,
	CanReadName = 4,
	CanReadDescription = 8,
	CanReadKind = 16,
	CanReadValue = 32,
	CanReadDeletedStatus = 64,
	CanReadPublicReadClaims = 2048,
	CanReadPublicChangeClaims = 4096,
	CanReadEveryoneReadClaims = 8192,
	CanReadEveryoneChangeClaims = 16384,
	CanReadThingUserRights = 128,
	CanReadThingUserRole = 256,
	CanReadThingUserStatus = 512,
	CanReadThingUserVisibility = 32768,
	CanReadThingUserReadClaims = 1024,
	CanReadThingUserChangeClaims = 1,
	AllClaims = 65535
}
export function validateThingUserReadClaims(userReadClaims: any): boolean;
export declare const enum ThingUserChangeClaims {
	NoClaims = 0,
	CanDeleteThing = 1,
	CanChangeName = 2,
	CanChangeDescription = 4,
	CanChangeKind = 8,
	CanChangeValue = 16,
	CanChangeDeletedStatus = 32,
	CanChangePublicReadClaims = 4096,
	CanChangePublicChangeClaims = 8192,
	CanChangeEveryoneReadClaims = 16384,
	CanChangeEveryoneChangeClaims = 32768,
	CanAddThingUserRights = 64,
	CanDeleteThingUserRights = 128,
	CanChangeThingUserRole = 256,
	CanChangeThingUserStatus = 512,
	CanChangeThingUserVisibility = 524288,
	CanChangeThingUserReadClaims = 1024,
	CanChangeThingUserChangeClaims = 2048,
	CanAddChildrenThing = 65536,
	CanRemoveChildrenThing = 131072,
	// In beta test
	CanOtherUsersChangeMyThingPos = 262144,
	AllClaims = 1048575
}
export function validateThingUserChangeClaims(userChangeClaims: any): boolean;
export declare const enum ThingKind {
	NoMatter = "0",
	genericId = "1",
	genericTxt = "the bees are laborious"
}
export declare const DefaultThingPos: Number;
export declare const enum RegisterByOnlyEmailStatus {
	UserAlreadyRegistered = 1,
	ConfirmPendingEmailSent = 2
}
export declare class RegisterByOnlyEmailDTO {
	public email: string;
	public confirmationToken: string;
	public status: any;
	constructor(email: any, confirmationToken: any, status: any);
}
export declare class EmailDTO {
	public value: string;
	public isConfirmed: boolean;
	constructor(email: any);
}
export declare class UserDTO {
	public id: string;
	public name: string;
	public username: string;
	public emails: EmailDTO[];
	public masterApiKey: string;
	constructor(user: any, fullInfos: any);
}
export declare class UserInfoDTO {
	public id: string;
	public name: string;
	constructor();
}
export declare class ThingDTO {
	public id: string;
	public creationDate: Date;
	public name: string;
	public kind: string;
	public pos: number; // Not used during creation or updating of thing
	public deletedStatus: ThingDeletedStates;
	public deletedDate: Date;
	public publicReadClaims: ThingUserReadClaims;
	public publicChangeClaims: ThingUserChangeClaims;
	public everyoneReadClaims: ThingUserReadClaims;
	public everyoneChangeClaims: ThingUserChangeClaims;
	public value: any;
	public userStatus: ThingUserStates;
	public userRole: ThingUserRoles;
	public userVisibility: ThingUserVisibility;
	public userReadClaims: ThingUserReadClaims;
	public userChangeClaims: ThingUserChangeClaims;
	public usersInfos: UserInfoDTO[];
}
export declare const enum RealtimeConnectionStates {
	Connecting = 0,
	Connected = 1,
	Reconnecting = 2,
	Disconnected = 4
}
export declare class RealtimeConnector {
	protected connectionStatus: RealtimeConnectionStates;
	protected url: string;
	protected authHook: null | (() => string | null);
	protected errorHook: null | ((error: any) => void);
	protected stateChangedHook: null | ((newState: RealtimeConnectionStates) => void);
	protected connectErrorHook: null | ((error: any) => void);
	protected on_connectionStatusChange(newState: RealtimeConnectionStates): void;
	subscribe(): void;
	unsubscribe(): void;
	setHook(_eventName: string, _hook: (...msg: any[]) => void): void;
	remHook(_eventName: any, _hook: (...msg: any[]) => void): void;
	constructor(url: string, authHook: () => string | null, errorHook: (error: any) => void, connectErrorHook: (error: any) => void, stateChangedHook: (change: RealtimeConnectionStates) => void);
	api(): Promise<any | any>;
}
export declare class SocketIORealtimeConnector extends RealtimeConnector {
	private socket;
	constructor(url: string, authHook: () => string | null, errorHook: (error: any) => void, connectErrorHook: (error: any) => void, stateChangedHook: (change: RealtimeConnectionStates) => void);
	private on_error;
	private on_connect_error;
	private on_connect;
	private on_disconnect;
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
	cancelerToken: CancelToken | undefined;
	private executor;
	constructor();
	cancel(): void;
	reset(): void;
}
export declare type HttpFailResult = any;
export declare class Helpers {
	static getRangeItemsFromResponse(response: any): ItemsRange;
}
export interface EndPointAddress {
	server: string;
	api: string;
}
export interface AccountUserData {
	accessToken: string;
	id: string;
	name: string;
	exp: number;
	iat: number;
}
export interface AccountActionControl {
	isLoggedIn: () => boolean;
	isAccessTokenExpired: () => boolean;
	getSecurityHeader: () => object | null;
	refreshToken: () => Promise<any>;
	resetApp: () => void;
}
export declare class AccountDataContext {
	private accountUrl;
	constructor(endPointAddress: EndPointAddress, accountActionControl: AccountActionControl);
	login({ username, password }: {
		username: string;
		password: string;
	}): Promise<AccountUserData>;
	loginBasic({ username, password }: {
		username: string;
		password: string;
	}): Promise<any>;
	logout(): Promise<any>;
}
export declare class AccountManager {
	private accountDataContext;
	private _appName;
	private _accessToken;
	private _userId;
	private _userName;
	private deltaTime;
	private _apiKey;
	private defaultAccountActionControl;
	resetLoginData(): void;
	private setLoginData;
	private getLoginData;
	constructor(appName: string, endPointAddress: EndPointAddress, apiKey?: string, accountActionControl?: AccountActionControl);
	get apiKey(): string | null;
	get accessToken(): string | null;
	getSecurityHeader: () => object | null;
	getSecurityToken: () => string | null;
	get isAccessTokenExpired(): boolean;
	get isLoggedIn(): boolean;
	get remember(): boolean;
	login(username: string, password: string, remember: boolean): Promise<AccountUserData>;
	logout(): Promise<any>;
}
export declare type UserInfo = any;
export declare class Thing {
	childrenSkip: number;
	childrenTotalItems: number;
	children: Thing[];
	id: string;
	creationDate: Date | null;
	name: string;
	kind: string;
	pos: number;
	deletedStatus: ThingDeletedStates;
	deletedDate: Date | null;
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
	parentThingId: string | null;
	thingFilter: object;
	valueFilter: object | null;
	orderBy: string | null;
	skip: number;
	top: number;
}
export interface ThingsDTOsDataSet {
	things: ThingDTO[];
	itemsRange: ItemsRange;
}
export declare class ThingsDataContext {
	private apiEndPointAddress;
	private thingsUrl;
	private thingsValueUrl;
	private thingsCmdUrl;
	private thingsPositionsUrl;
	private thingChildrenUrl;
	private thingDeleteChildUrl;
	constructor(endPointAddress: EndPointAddress);
	getThing(thingId: string): Promise<ThingDTO>;
	getThings(parameter: ThingsGetParams, canceler?: HttpRequestCanceler): Promise<ThingsDTOsDataSet>;
	createThing(ThingDTO: ThingDTO): Promise<ThingDTO>;
	updateThing(thingId: string, ThingDTO: ThingDTO): Promise<ThingDTO>;
	deleteThing(thingId: string): Promise<any>;
	getThingChildrenIds(parentThingId: string): Promise<string[]>;
	addChildToParent(parentThingId: string, childThingId: string): Promise<any>;
	deleteThingChild(parentThingId: string, childThingId: string): Promise<any>;
	getThingValue(thingId: string): Promise<any>;
	putThingValue(thingId: string, asCmd: boolean, value: any): Promise<any>;
	putThingsPositions(positions: ThingPositionRaw[]): Promise<any>;
}
export interface ThingClaims {
	publicReadClaims: ThingUserReadClaims;
	publicChangeClaims: ThingUserChangeClaims;
	everyoneReadClaims: ThingUserReadClaims;
	everyoneChangeClaims: ThingUserChangeClaims;
	creatorUserReadClaims: ThingUserReadClaims;
	creatorUserChangeClaims: ThingUserChangeClaims;
}
export interface ThingsDataSet {
	things: Thing[];
	itemsRange: ItemsRange;
}
export declare class ThingsManager {
	private readonly mainThing;
	private thingKind;
	private thingClaims;
	private thingsDataContext;
	private realtimeConnector;
	private getThingsParams;
	private getChindrenThingsParams;
	constructor(mainThing: Thing, thingKind: string, thingClaims: ThingClaims, thingsDataContext: ThingsDataContext, realtimeConnector: RealtimeConnector);
	reset(): void;
	init(): void;
	done(): void;
	private searchThingById;
	private readonly onCreateThing;
	private readonly onUpdateThingValue;
	private getThings;
	private getMoreThingChildren;
	getMoreThings(canceler: HttpRequestCanceler): Promise<ThingsDataSet[]>;
	getThingsTotalItems(): Number;
	getThing(thingId: string): Promise<Thing>;
	putThingValue(thingId: string, asCmd: boolean, value: any): Promise<any>;
}
declare class thingsHub {
	private endPointAddress;
	private accountManager;
	private thingsDatacontext;
	private realTimeConnector;
	private thingsManager;
	private thingsManagerClaims;
	private onError;
	private onConnectError;
	private onStateChanged;
	private mainThing;
	things: Thing[];
	private httpRequestCanceler;
	constructor(address: string, apiKey: string, thingsKind: string);
	on(eventName: string, hook: (...msg: any[]) => void): this;
	off(eventName: string, hook: (...msg: any[]) => void): this;
	get(): this;
	cancel(): this;
}
export declare const th: (address: string, apiKey: string, thingsKind?: string) => thingsHub;

export as namespace thingshub;

export {};
