(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("axios"), require("socket.io-client"));
	else if(typeof define === 'function' && define.amd)
		define(["axios", "socket.io-client"], factory);
	else if(typeof exports === 'object')
		exports["thingshub"] = factory(require("axios"), require("socket.io-client"));
	else
		root["thingshub"] = factory(root["axios"], root["io"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_axios__, __WEBPACK_EXTERNAL_MODULE_socket_io_client__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../common/src/dtos.js":
/*!*****************************!*\
  !*** ../common/src/dtos.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const thConstants = __webpack_require__(/*! ./thConstants */ "../common/src/thConstants.js");

exports.RegisterByOnlyEmailStatus = {
	UserAlreadyRegistered : 1,
	ConfirmPendingEmailSent : 2,
};

class RegisterByOnlyEmailDTO {
	constructor(email, confirmationToken, status) {
		this.email = email;
		this.confirmationToken = confirmationToken;
		this.status = status;
	}
}
exports.RegisterByOnlyEmailDTO = RegisterByOnlyEmailDTO;

class EmailDTO {
	constructor(email) {
		this.value = email.email;
		this.isConfimed = email.isConfimed;
	}
}
exports.EmailDTO = EmailDTO;

class UserDTO { 
	constructor(user, fullInfos) {
		this.id = user._id;
		this.name = user.name;
  
		if (!fullInfos) {
			return;
		}
  
		this.emails = [];
		this.username = user.userName;
		user.emails.foreach(email => this.emails.push(new EmailDTO(email)));
		this.masterApiKey = user.masterApiKey;
	}
}
exports.UserDTO = UserDTO;

class UserInfoDTO {
	constructor() {
	
		this.id = "";
		this.name = "the bees are laborious";
	}
}
exports.UserInfoDTO = UserInfoDTO;

class ThingDTO {
	constructor() {
		
		this.id = "";

		this.creationDate = null;
		
		this.name = "";
		
		this.kind = thConstants.ThingKind.genericId;
		
		this.pos = 0;// Not used during creation or updating of thing
		
		this.deletedStatus = thConstants.ThingDeletedStates.NoMatter;
		this.deletedDate = null;
		
		this.publicReadClaims = thConstants.ThingUserReadClaims.NoClaims;
		this.publicChangeClaims = thConstants.ThingUserChangeClaims.NoClaims;
		
		this.everyoneReadClaims = thConstants.ThingUserReadClaims.NoClaims;
		this.everyoneChangeClaims = thConstants.ThingUserChangeClaims.NoClaims;
		
		this.value = {};
		
		this.userStatus = thConstants.ThingUserStates.NoMatter;
		this.userRole = thConstants.ThingUserRoles.NoMatter;
		this.userVisibility = thConstants.ThingUserVisibility.NoMatter;
		
		this.userReadClaims = thConstants.ThingUserReadClaims.NoClaims;
		this.userChangeClaims = thConstants.ThingUserChangeClaims.NoClaims;
		
		this.usersInfos = []; // Not used during creation or updating of thing
	}
}
exports.ThingDTO = ThingDTO;





/***/ }),

/***/ "../common/src/thConstants.js":
/*!************************************!*\
  !*** ../common/src/thConstants.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const ThingDeletedStates = {
	NoMatter  : 0,  // Interna state. Do not useful for external usage
	Ok        : 1,
	Deleted   : 2
};
exports.ThingDeletedStates = ThingDeletedStates;

exports.validateThingDeletedStatus = function validateThingDeletedStatus(deletedStatus) {
	switch(deletedStatus) {
	case ThingDeletedStates.NoMatter:
	case ThingDeletedStates.Ok:
	case ThingDeletedStates.Deleted:
		return true;
	}
	return false;
};

// The User can not have more Roles in the same time
const ThingUserRoles = {
	NoMatter      : 0,  // Internal state. Do not use for external use like filter
	Administrator : 1,
	User          : 2
};
exports.ThingUserRoles = ThingUserRoles;

exports.validateThingUserRoles = function validateThingUserRoles(userRole) {
	switch(userRole) {
	case ThingUserRoles.NoMatter:
	case ThingUserRoles.Administrator:
	case ThingUserRoles.User:
		return true;
	}
	return false;
};

// The User can not have more Status at same time
const ThingUserStates = {
	NoMatter    : 0,  // Internal state. Do not use for external use like filter
	Ok          : 1,
	WaitForAuth : 2,
	Deleted     : 4
};
exports.ThingUserStates = ThingUserStates;

exports.validateThingUserStatus = function validateThingUserStatus(userStatus) {
	switch(userStatus) {
	case ThingUserStates.NoMatter:
	case ThingUserStates.Ok:
	case ThingUserStates.WaitForAuth:
	case ThingUserStates.Deleted:
		return true;
	}
	return false;
};

const ThingUserVisibility = {
	NoMatter  : 0,  // Internal state. Do not use for external use like filter
	Visible       : 1,
	Hidden        : 2
};
exports.ThingUserVisibility = ThingUserVisibility;

exports.validateThingUserVisibility = function validateThingUserVisibility(visibility) {
	switch(visibility) {
	case ThingUserVisibility.NoMatter:
	case ThingUserVisibility.Visible:
	case ThingUserVisibility.Hidden:
		return true;
	}
	return false;
};

// Do not have validation function since are bitwise values

const ThingUserReadClaims = {
	NoClaims: 0,

	CanReadCreationDate: 2,
	CanReadName: 4,
	CanReadDescription: 8,
	CanReadKind: 16,
	CanReadValue: 32,
	CanReadDeletedStatus: 64,

	CanReadPublicReadClaims: 2048,
	CanReadPublicChangeClaims: 4096,
	CanReadEveryoneReadClaims: 8192,
	CanReadEveryoneChangeClaims: 16384,

	CanReadThingUserRights: 128,
	CanReadThingUserRole: 256,
	CanReadThingUserStatus: 512,
	CanReadThingUserVisibility: 32768,

	CanReadThingUserReadClaims: 1024,
	CanReadThingUserChangeClaims : 1
};
// ShortCut
// INFO: Max int value 0x7FFFFFFF;//2147483647 - 32 bit with sign. Javascript bit manipulation limit
ThingUserReadClaims.AllClaims = ThingUserReadClaims.CanReadThingUserChangeClaims |
ThingUserReadClaims.CanReadCreationDate | ThingUserReadClaims.CanReadName | ThingUserReadClaims.CanReadDescription |
ThingUserReadClaims.CanReadKind | ThingUserReadClaims.CanReadValue | ThingUserReadClaims.CanReadDeletedStatus |
ThingUserReadClaims.CanReadThingUserRights | ThingUserReadClaims.CanReadThingUserRole | ThingUserReadClaims.CanReadThingUserVisibility |
ThingUserReadClaims.CanReadThingUserStatus | ThingUserReadClaims.CanReadThingUserReadClaims | ThingUserReadClaims.CanReadPublicReadClaims |
ThingUserReadClaims.CanReadPublicChangeClaims | ThingUserReadClaims.CanReadEveryoneReadClaims | ThingUserReadClaims.CanReadEveryoneChangeClaims;

exports.ThingUserReadClaims = ThingUserReadClaims;
exports.validateThingUserReadClaims = (userReadClaims) => {
	return userReadClaims <= ThingUserReadClaims.AllClaims && userReadClaims >= ThingUserReadClaims.NoClaims;
};

// Do not have validation function since are bitwise values
const ThingUserChangeClaims = {
	NoClaims: 0,

	CanDeleteThing: 1,
	CanChangeName: 2,
	CanChangeDescription: 4,
	CanChangeKind: 8,
	CanChangeValue: 16,
	CanChangeDeletedStatus: 32,

	CanChangePublicReadClaims: 4096,
	CanChangePublicChangeClaims: 8192,
	CanChangeEveryoneReadClaims: 16384,
	CanChangeEveryoneChangeClaims: 32768,

	CanAddThingUserRights: 64,
	CanDeleteThingUserRights: 128,

	CanChangeThingUserRole: 256,
	CanChangeThingUserStatus: 512,
	CanChangeThingUserVisibility: 524288,

	CanChangeThingUserReadClaims: 1024,
	CanChangeThingUserChangeClaims: 2048,

	CanAddChildrenThing: 65536,
	CanRemoveChildrenThing: 131072,

	// In beta test
	CanOtherUsersChangeMyThingPos: 262144
};
// ShortCut
// INFO: Max int value 0x7FFFFFFF;//2147483647 - 32 bit with sign. Javascript bit manipulation limit
ThingUserChangeClaims.AllClaims = ThingUserChangeClaims.CanDeleteThing | ThingUserChangeClaims.CanChangeName | ThingUserChangeClaims.CanChangeDescription |
ThingUserChangeClaims.CanChangeKind | ThingUserChangeClaims.CanChangeValue | ThingUserChangeClaims.CanChangeDeletedStatus |
ThingUserChangeClaims.CanAddThingUserRights | ThingUserChangeClaims.CanDeleteThingUserRights | ThingUserChangeClaims.CanChangeThingUserRole | ThingUserChangeClaims.CanChangeThingUserVisibility |
ThingUserChangeClaims.CanChangeThingUserStatus | ThingUserChangeClaims.CanChangeThingUserReadClaims | ThingUserChangeClaims.CanChangeThingUserChangeClaims |
ThingUserChangeClaims.CanChangePublicReadClaims | ThingUserChangeClaims.CanChangePublicChangeClaims | ThingUserChangeClaims.CanChangeEveryoneReadClaims | ThingUserChangeClaims.CanChangeEveryoneChangeClaims |
ThingUserChangeClaims.CanAddChildrenThing | ThingUserChangeClaims.CanRemoveChildrenThing;

exports.ThingUserChangeClaims = ThingUserChangeClaims;
exports.validateThingUserChangeClaims = (userChangeClaims) => {
	return userChangeClaims <= ThingUserChangeClaims.AllClaims && userChangeClaims >= ThingUserChangeClaims.NoClaims;
};

exports.ThingKind = {
	NoMatter: "0",
	genericId : "1",
	genericTxt : "the bees are laborious"
};

const DefaultThingPos = Number.MAX_SAFE_INTEGER;
exports.DefaultThingPos = DefaultThingPos;




/***/ }),

/***/ "./node_modules/define-properties/index.js":
/*!*************************************************!*\
  !*** ./node_modules/define-properties/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keys = __webpack_require__(/*! object-keys */ "./node_modules/object-keys/index.js");
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		origDefineProperty(obj, 'x', { enumerable: false, value: obj });
		// eslint-disable-next-line no-unused-vars, no-restricted-syntax
		for (var _ in obj) { // jscs:ignore disallowUnusedVariables
			return false;
		}
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

var defineProperty = function (object, name, value, predicate) {
	if (name in object && (!isFunction(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		origDefineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;


/***/ }),

/***/ "./node_modules/es-abstract/2018/IsCallable.js":
/*!*****************************************************!*\
  !*** ./node_modules/es-abstract/2018/IsCallable.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// http://www.ecma-international.org/ecma-262/5.1/#sec-9.11

module.exports = __webpack_require__(/*! is-callable */ "./node_modules/is-callable/index.js");


/***/ }),

/***/ "./node_modules/es-abstract/2018/IsConstructor.js":
/*!********************************************************!*\
  !*** ./node_modules/es-abstract/2018/IsConstructor.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// https://www.ecma-international.org/ecma-262/6.0/#sec-isconstructor

module.exports = function IsConstructor(argument) {
	return typeof argument === 'function' && !!argument.prototype; // unfortunately there's no way to truly check this without try/catch `new argument`
};


/***/ }),

/***/ "./node_modules/es-abstract/2018/SpeciesConstructor.js":
/*!*************************************************************!*\
  !*** ./node_modules/es-abstract/2018/SpeciesConstructor.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var GetIntrinsic = __webpack_require__(/*! ../GetIntrinsic */ "./node_modules/es-abstract/GetIntrinsic.js");

var $species = GetIntrinsic('%Symbol.species%', true);
var $TypeError = GetIntrinsic('%TypeError%');

var IsConstructor = __webpack_require__(/*! ./IsConstructor */ "./node_modules/es-abstract/2018/IsConstructor.js");
var Type = __webpack_require__(/*! ./Type */ "./node_modules/es-abstract/2018/Type.js");

// https://ecma-international.org/ecma-262/6.0/#sec-speciesconstructor

module.exports = function SpeciesConstructor(O, defaultConstructor) {
	if (Type(O) !== 'Object') {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	var C = O.constructor;
	if (typeof C === 'undefined') {
		return defaultConstructor;
	}
	if (Type(C) !== 'Object') {
		throw new $TypeError('O.constructor is not an Object');
	}
	var S = $species ? C[$species] : void 0;
	if (S == null) {
		return defaultConstructor;
	}
	if (IsConstructor(S)) {
		return S;
	}
	throw new $TypeError('no constructor found');
};


/***/ }),

/***/ "./node_modules/es-abstract/2018/Type.js":
/*!***********************************************!*\
  !*** ./node_modules/es-abstract/2018/Type.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ES5Type = __webpack_require__(/*! ../5/Type */ "./node_modules/es-abstract/5/Type.js");

// https://www.ecma-international.org/ecma-262/6.0/#sec-tostring

module.exports = function Type(x) {
	if (typeof x === 'symbol') {
		return 'Symbol';
	}
	return ES5Type(x);
};


/***/ }),

/***/ "./node_modules/es-abstract/5/Type.js":
/*!********************************************!*\
  !*** ./node_modules/es-abstract/5/Type.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// https://www.ecma-international.org/ecma-262/5.1/#sec-8

module.exports = function Type(x) {
	if (x === null) {
		return 'Null';
	}
	if (typeof x === 'undefined') {
		return 'Undefined';
	}
	if (typeof x === 'function' || typeof x === 'object') {
		return 'Object';
	}
	if (typeof x === 'number') {
		return 'Number';
	}
	if (typeof x === 'boolean') {
		return 'Boolean';
	}
	if (typeof x === 'string') {
		return 'String';
	}
};


/***/ }),

/***/ "./node_modules/es-abstract/GetIntrinsic.js":
/*!**************************************************!*\
  !*** ./node_modules/es-abstract/GetIntrinsic.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* globals
	Atomics,
	SharedArrayBuffer,
*/

var undefined;

var $TypeError = TypeError;

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () { throw new $TypeError(); };
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = __webpack_require__(/*! has-symbols */ "./node_modules/has-symbols/index.js")();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var generator; // = function * () {};
var generatorFunction = generator ? getProto(generator) : undefined;
var asyncFn; // async function() {};
var asyncFunction = asyncFn ? asyncFn.constructor : undefined;
var asyncGen; // async function * () {};
var asyncGenFunction = asyncGen ? getProto(asyncGen) : undefined;
var asyncGenIterator = asyncGen ? asyncGen() : undefined;

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayBufferPrototype%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer.prototype,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%ArrayPrototype%': Array.prototype,
	'%ArrayProto_entries%': Array.prototype.entries,
	'%ArrayProto_forEach%': Array.prototype.forEach,
	'%ArrayProto_keys%': Array.prototype.keys,
	'%ArrayProto_values%': Array.prototype.values,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': asyncFunction,
	'%AsyncFunctionPrototype%': asyncFunction ? asyncFunction.prototype : undefined,
	'%AsyncGenerator%': asyncGen ? getProto(asyncGenIterator) : undefined,
	'%AsyncGeneratorFunction%': asyncGenFunction,
	'%AsyncGeneratorPrototype%': asyncGenFunction ? asyncGenFunction.prototype : undefined,
	'%AsyncIteratorPrototype%': asyncGenIterator && hasSymbols && Symbol.asyncIterator ? asyncGenIterator[Symbol.asyncIterator]() : undefined,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%Boolean%': Boolean,
	'%BooleanPrototype%': Boolean.prototype,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%DataViewPrototype%': typeof DataView === 'undefined' ? undefined : DataView.prototype,
	'%Date%': Date,
	'%DatePrototype%': Date.prototype,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%ErrorPrototype%': Error.prototype,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%EvalErrorPrototype%': EvalError.prototype,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float32ArrayPrototype%': typeof Float32Array === 'undefined' ? undefined : Float32Array.prototype,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%Float64ArrayPrototype%': typeof Float64Array === 'undefined' ? undefined : Float64Array.prototype,
	'%Function%': Function,
	'%FunctionPrototype%': Function.prototype,
	'%Generator%': generator ? getProto(generator()) : undefined,
	'%GeneratorFunction%': generatorFunction,
	'%GeneratorPrototype%': generatorFunction ? generatorFunction.prototype : undefined,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int8ArrayPrototype%': typeof Int8Array === 'undefined' ? undefined : Int8Array.prototype,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int16ArrayPrototype%': typeof Int16Array === 'undefined' ? undefined : Int8Array.prototype,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%Int32ArrayPrototype%': typeof Int32Array === 'undefined' ? undefined : Int32Array.prototype,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%JSONParse%': typeof JSON === 'object' ? JSON.parse : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%MapPrototype%': typeof Map === 'undefined' ? undefined : Map.prototype,
	'%Math%': Math,
	'%Number%': Number,
	'%NumberPrototype%': Number.prototype,
	'%Object%': Object,
	'%ObjectPrototype%': Object.prototype,
	'%ObjProto_toString%': Object.prototype.toString,
	'%ObjProto_valueOf%': Object.prototype.valueOf,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%PromisePrototype%': typeof Promise === 'undefined' ? undefined : Promise.prototype,
	'%PromiseProto_then%': typeof Promise === 'undefined' ? undefined : Promise.prototype.then,
	'%Promise_all%': typeof Promise === 'undefined' ? undefined : Promise.all,
	'%Promise_reject%': typeof Promise === 'undefined' ? undefined : Promise.reject,
	'%Promise_resolve%': typeof Promise === 'undefined' ? undefined : Promise.resolve,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%RangeErrorPrototype%': RangeError.prototype,
	'%ReferenceError%': ReferenceError,
	'%ReferenceErrorPrototype%': ReferenceError.prototype,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%RegExpPrototype%': RegExp.prototype,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SetPrototype%': typeof Set === 'undefined' ? undefined : Set.prototype,
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%SharedArrayBufferPrototype%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer.prototype,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%StringPrototype%': String.prototype,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SymbolPrototype%': hasSymbols ? Symbol.prototype : undefined,
	'%SyntaxError%': SyntaxError,
	'%SyntaxErrorPrototype%': SyntaxError.prototype,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypedArrayPrototype%': TypedArray ? TypedArray.prototype : undefined,
	'%TypeError%': $TypeError,
	'%TypeErrorPrototype%': $TypeError.prototype,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ArrayPrototype%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array.prototype,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint8ClampedArrayPrototype%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray.prototype,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint16ArrayPrototype%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array.prototype,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%Uint32ArrayPrototype%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array.prototype,
	'%URIError%': URIError,
	'%URIErrorPrototype%': URIError.prototype,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakMapPrototype%': typeof WeakMap === 'undefined' ? undefined : WeakMap.prototype,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet,
	'%WeakSetPrototype%': typeof WeakSet === 'undefined' ? undefined : WeakSet.prototype
};

var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var $replace = bind.call(Function.call, String.prototype.replace);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : (number || match);
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	if (!(name in INTRINSICS)) {
		throw new SyntaxError('intrinsic ' + name + ' does not exist!');
	}

	// istanbul ignore if // hopefully this is impossible to test :-)
	if (typeof INTRINSICS[name] === 'undefined' && !allowMissing) {
		throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
	}

	return INTRINSICS[name];
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new TypeError('"allowMissing" argument must be a boolean');
	}

	var parts = stringToPath(name);

	var value = getBaseIntrinsic('%' + (parts.length > 0 ? parts[0] : '') + '%', allowMissing);
	for (var i = 1; i < parts.length; i += 1) {
		if (value != null) {
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, parts[i]);
				value = desc ? (desc.get || desc.value) : value[parts[i]];
			} else {
				value = value[parts[i]];
			}
		}
	}
	return value;
};


/***/ }),

/***/ "./node_modules/function-bind/implementation.js":
/*!******************************************************!*\
  !*** ./node_modules/function-bind/implementation.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};


/***/ }),

/***/ "./node_modules/function-bind/index.js":
/*!*********************************************!*\
  !*** ./node_modules/function-bind/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/function-bind/implementation.js");

module.exports = Function.prototype.bind || implementation;


/***/ }),

/***/ "./node_modules/has-symbols/index.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var origSymbol = global.Symbol;
var hasSymbolSham = __webpack_require__(/*! ./shams */ "./node_modules/has-symbols/shams.js");

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/has-symbols/shams.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/shams.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};


/***/ }),

/***/ "./node_modules/is-callable/index.js":
/*!*******************************************!*\
  !*** ./node_modules/is-callable/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fnToStr = Function.prototype.toString;

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isCallable(value) {
	if (!value) { return false; }
	if (typeof value !== 'function' && typeof value !== 'object') { return false; }
	if (typeof value === 'function' && !value.prototype) { return true; }
	if (hasToStringTag) { return tryFunctionObject(value); }
	if (isES6ClassFn(value)) { return false; }
	var strClass = toStr.call(value);
	return strClass === fnClass || strClass === genClass;
};


/***/ }),

/***/ "./node_modules/jwt-decode/lib/atob.js":
/*!*********************************************!*\
  !*** ./node_modules/jwt-decode/lib/atob.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * The code was extracted from:
 * https://github.com/davidchambers/Base64.js
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function InvalidCharacterError(message) {
  this.message = message;
}

InvalidCharacterError.prototype = new Error();
InvalidCharacterError.prototype.name = 'InvalidCharacterError';

function polyfill (input) {
  var str = String(input).replace(/=+$/, '');
  if (str.length % 4 == 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt(idx++);
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}


module.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;


/***/ }),

/***/ "./node_modules/jwt-decode/lib/base64_url_decode.js":
/*!**********************************************************!*\
  !*** ./node_modules/jwt-decode/lib/base64_url_decode.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var atob = __webpack_require__(/*! ./atob */ "./node_modules/jwt-decode/lib/atob.js");

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    var code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
}

module.exports = function(str) {
  var output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw "Illegal base64url string!";
  }

  try{
    return b64DecodeUnicode(output);
  } catch (err) {
    return atob(output);
  }
};


/***/ }),

/***/ "./node_modules/jwt-decode/lib/index.js":
/*!**********************************************!*\
  !*** ./node_modules/jwt-decode/lib/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var base64_url_decode = __webpack_require__(/*! ./base64_url_decode */ "./node_modules/jwt-decode/lib/base64_url_decode.js");

function InvalidTokenError(message) {
  this.message = message;
}

InvalidTokenError.prototype = new Error();
InvalidTokenError.prototype.name = 'InvalidTokenError';

module.exports = function (token,options) {
  if (typeof token !== 'string') {
    throw new InvalidTokenError('Invalid token specified');
  }

  options = options || {};
  var pos = options.header === true ? 0 : 1;
  try {
    return JSON.parse(base64_url_decode(token.split('.')[pos]));
  } catch (e) {
    throw new InvalidTokenError('Invalid token specified: ' + e.message);
  }
};

module.exports.InvalidTokenError = InvalidTokenError;


/***/ }),

/***/ "./node_modules/object-keys/implementation.js":
/*!****************************************************!*\
  !*** ./node_modules/object-keys/implementation.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = __webpack_require__(/*! ./isArguments */ "./node_modules/object-keys/isArguments.js"); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;


/***/ }),

/***/ "./node_modules/object-keys/index.js":
/*!*******************************************!*\
  !*** ./node_modules/object-keys/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var slice = Array.prototype.slice;
var isArgs = __webpack_require__(/*! ./isArguments */ "./node_modules/object-keys/isArguments.js");

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : __webpack_require__(/*! ./implementation */ "./node_modules/object-keys/implementation.js");

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;


/***/ }),

/***/ "./node_modules/object-keys/isArguments.js":
/*!*************************************************!*\
  !*** ./node_modules/object-keys/isArguments.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};


/***/ }),

/***/ "./node_modules/promise.prototype.finally/implementation.js":
/*!******************************************************************!*\
  !*** ./node_modules/promise.prototype.finally/implementation.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var requirePromise = __webpack_require__(/*! ./requirePromise */ "./node_modules/promise.prototype.finally/requirePromise.js");

requirePromise();

var IsCallable = __webpack_require__(/*! es-abstract/2018/IsCallable */ "./node_modules/es-abstract/2018/IsCallable.js");
var SpeciesConstructor = __webpack_require__(/*! es-abstract/2018/SpeciesConstructor */ "./node_modules/es-abstract/2018/SpeciesConstructor.js");
var Type = __webpack_require__(/*! es-abstract/2018/Type */ "./node_modules/es-abstract/2018/Type.js");

var promiseResolve = function PromiseResolve(C, value) {
	return new C(function (resolve) {
		resolve(value);
	});
};

var OriginalPromise = Promise;

var createThenFinally = function CreateThenFinally(C, onFinally) {
	return function (value) {
		var result = onFinally();
		var promise = promiseResolve(C, result);
		var valueThunk = function () {
			return value;
		};
		return promise.then(valueThunk);
	};
};

var createCatchFinally = function CreateCatchFinally(C, onFinally) {
	return function (reason) {
		var result = onFinally();
		var promise = promiseResolve(C, result);
		var thrower = function () {
			throw reason;
		};
		return promise.then(thrower);
	};
};

var promiseFinally = function finally_(onFinally) {
	/* eslint no-invalid-this: 0 */

	var promise = this;

	if (Type(promise) !== 'Object') {
		throw new TypeError('receiver is not an Object');
	}

	var C = SpeciesConstructor(promise, OriginalPromise); // may throw

	var thenFinally = onFinally;
	var catchFinally = onFinally;
	if (IsCallable(onFinally)) {
		thenFinally = createThenFinally(C, onFinally);
		catchFinally = createCatchFinally(C, onFinally);
	}

	return promise.then(thenFinally, catchFinally);
};

if (Object.getOwnPropertyDescriptor) {
	var descriptor = Object.getOwnPropertyDescriptor(promiseFinally, 'name');
	if (descriptor && descriptor.configurable) {
		Object.defineProperty(promiseFinally, 'name', { configurable: true, value: 'finally' });
	}
}

module.exports = promiseFinally;


/***/ }),

/***/ "./node_modules/promise.prototype.finally/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/promise.prototype.finally/index.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var define = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");

var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/promise.prototype.finally/implementation.js");
var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/promise.prototype.finally/polyfill.js");
var shim = __webpack_require__(/*! ./shim */ "./node_modules/promise.prototype.finally/shim.js");

var bound = bind.call(Function.call, getPolyfill());

define(bound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = bound;


/***/ }),

/***/ "./node_modules/promise.prototype.finally/polyfill.js":
/*!************************************************************!*\
  !*** ./node_modules/promise.prototype.finally/polyfill.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var requirePromise = __webpack_require__(/*! ./requirePromise */ "./node_modules/promise.prototype.finally/requirePromise.js");

var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/promise.prototype.finally/implementation.js");

module.exports = function getPolyfill() {
	requirePromise();
	return typeof Promise.prototype['finally'] === 'function' ? Promise.prototype['finally'] : implementation;
};


/***/ }),

/***/ "./node_modules/promise.prototype.finally/requirePromise.js":
/*!******************************************************************!*\
  !*** ./node_modules/promise.prototype.finally/requirePromise.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function requirePromise() {
	if (typeof Promise !== 'function') {
		throw new TypeError('`Promise.prototype.finally` requires a global `Promise` be available.');
	}
};


/***/ }),

/***/ "./node_modules/promise.prototype.finally/shim.js":
/*!********************************************************!*\
  !*** ./node_modules/promise.prototype.finally/shim.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var requirePromise = __webpack_require__(/*! ./requirePromise */ "./node_modules/promise.prototype.finally/requirePromise.js");

var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/promise.prototype.finally/polyfill.js");
var define = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");

module.exports = function shimPromiseFinally() {
	requirePromise();

	var polyfill = getPolyfill();
	define(Promise.prototype, { 'finally': polyfill }, {
		'finally': function testFinally() {
			return Promise.prototype['finally'] !== polyfill;
		}
	});
	return polyfill;
};


/***/ }),

/***/ "./node_modules/qs/lib/formats.js":
/*!****************************************!*\
  !*** ./node_modules/qs/lib/formats.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var util = __webpack_require__(/*! ./utils */ "./node_modules/qs/lib/utils.js");

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = util.assign(
    {
        'default': Format.RFC3986,
        formatters: {
            RFC1738: function (value) {
                return replace.call(value, percentTwenties, '+');
            },
            RFC3986: function (value) {
                return String(value);
            }
        }
    },
    Format
);


/***/ }),

/***/ "./node_modules/qs/lib/index.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stringify = __webpack_require__(/*! ./stringify */ "./node_modules/qs/lib/stringify.js");
var parse = __webpack_require__(/*! ./parse */ "./node_modules/qs/lib/parse.js");
var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};


/***/ }),

/***/ "./node_modules/qs/lib/parse.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/parse.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/qs/lib/utils.js");

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = options.decoder(part.slice(pos + 1), defaults.decoder, charset, 'value');
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
            val = val.split(',');
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options) {
    var leaf = val;

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};


/***/ }),

/***/ "./node_modules/qs/lib/stringify.js":
/*!******************************************!*\
  !*** ./node_modules/qs/lib/stringify.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/qs/lib/utils.js");
var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    formatter,
    encodeValuesOnly,
    charset
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = obj.join(',');
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key') : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key');
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value'))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (isArray(obj)) {
            pushToArray(values, stringify(
                obj[key],
                typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix,
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly,
                charset
            ));
        } else {
            pushToArray(values, stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly,
                charset
            ));
        }
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(
            obj[key],
            key,
            generateArrayPrefix,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.formatter,
            options.encodeValuesOnly,
            options.charset
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};


/***/ }),

/***/ "./node_modules/qs/lib/utils.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/utils.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    merge: merge
};


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/accountDataContext.ts":
/*!***********************************!*\
  !*** ./src/accountDataContext.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const qs = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
const axios_1 = __webpack_require__(/*! axios */ "axios");
const jwtDecode = __webpack_require__(/*! jwt-decode */ "./node_modules/jwt-decode/lib/index.js");
class AccountDataContext {
    constructor(endPointAddress, accountActionControl) {
        this.accountActionControl = accountActionControl;
        this.accountUrl = "";
        this.accountUrl = endPointAddress.api + "/account";
        axios_1.default.interceptors.response.use((response) => {
            return response;
        }, (err) => __awaiter(this, void 0, void 0, function* () {
            const error = err.response;
            if (accountActionControl && error && error.status === 401 && error.config && !error.config.__isRetryRequest) {
                try {
                    const response = yield this.getNewAccessToken();
                    error.config.__isRetryRequest = true;
                    // set new access token after refreshing it
                    error.config.headers = this.accountActionControl.getSecurityHeader();
                    return axios_1.default(error.config);
                }
                catch (e) {
                    // refreshing has failed => redirect to login
                    // clear cookie (with logout action) and return to identityserver to new login
                    // (window as any).location = "/account/logout";
                    // TODO: Can be called many times - https://docs.google.com/spreadsheets/d/1Ks-K10kmLcHOom7igTkQ8wtRSJ-73i1hftUAE4E9q80/edit#gid=1455384855&range=D7
                    this.accountActionControl.resetApp();
                    return Promise.reject(e);
                }
            }
            return Promise.reject(error);
        }));
    }
    getNewAccessToken() {
        if (!this.authTokenRequest) {
            this.authTokenRequest = this.accountActionControl.refreshToken();
            this.authTokenRequest.then(response => {
                this.authTokenRequest = null;
            }).catch(error => {
                this.authTokenRequest = null;
            });
        }
        return this.authTokenRequest;
    }
    // TODO: https://docs.google.com/spreadsheets/d/1Ks-K10kmLcHOom7igTkQ8wtRSJ-73i1hftUAE4E9q80/edit#gid=1455384855&range=C4
    login({ username, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            let loginData = {
                username,
                password
            };
            const config = {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                __isRetryRequest: true
            };
            const response = yield axios_1.default.post(this.accountUrl + "/login", qs.stringify(loginData), config);
            const accountUserDataRaw = jwtDecode(response.data.access_token);
            return {
                accessToken: response.data.access_token,
                id: accountUserDataRaw.sub,
                name: accountUserDataRaw.name,
                exp: accountUserDataRaw.exp
            };
        });
    }
    // TODO: To check
    loginBasic({ username, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(this.accountUrl + "/login", "grant_type=client_credentials", {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + btoa(username + ":" + password)
                }
            });
            return response.data;
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(this.accountUrl + "/logout", null, {
                headers: this.accountActionControl ? this.accountActionControl.getSecurityHeader() : null
            });
            return response.data;
        });
    }
}
exports.AccountDataContext = AccountDataContext;


/***/ }),

/***/ "./src/accountManager.ts":
/*!*******************************!*\
  !*** ./src/accountManager.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtDecode = __webpack_require__(/*! jwt-decode */ "./node_modules/jwt-decode/lib/index.js");
class AccountManager {
    constructor(appName, accountDataContext, apiKey) {
        this.dummy8 = "carmelo";
        this._appName = null;
        this._accessToken = null;
        this._userId = null;
        this._userName = null;
        this.deltaTime = null;
        //INFO: apiKey is never persistent
        this._apiKey = null;
        this.getSecurityHeader = () => {
            return this.apiKey ? { thapikey: this.apiKey } : { Authorization: "Bearer " + this.accessToken };
        };
        this.getSecurityToken = () => {
            return this.apiKey ? "token=" + this.apiKey : "token=" + this.accessToken;
        };
        this._appName = appName;
        this.accountDataContext = accountDataContext;
        this.getLoginData(apiKey);
        if (this.apiKey)
            return;
        if (!this.accessToken)
            return;
        const accountUserDataRaw = jwtDecode(this.accessToken);
        let dateNow = new Date();
        if (accountUserDataRaw.exp < Math.trunc(dateNow.getTime() / 1000)) {
            this.resetLoginData();
        }
    }
    //TODO: Why is public?
    resetLoginData() {
        this._accessToken = null;
        this._userId = null;
        this._userName = null;
        localStorage.removeItem(this._appName + "_Remember");
        localStorage.removeItem(this._appName + "_AccessToken");
        sessionStorage.removeItem(this._appName + "_AccessToken");
        localStorage.removeItem(this._appName + "_DeltaTime");
        sessionStorage.removeItem(this._appName + "_DeltaTime");
        localStorage.removeItem(this._appName + "_UserId");
        sessionStorage.removeItem(this._appName + "_UserId");
        localStorage.removeItem(this._appName + "_Username");
        sessionStorage.removeItem(this._appName + "_Username");
    }
    setLoginData(accountUserData, remember) {
        this._apiKey = null;
        this._accessToken = accountUserData.accessToken;
        this._userId = accountUserData.id;
        this._userName = accountUserData.name;
        this.deltaTime = 0;
        sessionStorage.setItem(this._appName + "_AccessToken", this._accessToken);
        sessionStorage.setItem(this._appName + "_UserId", this._userId);
        sessionStorage.setItem(this._appName + "_Username", this._userName);
        sessionStorage.setItem(this._appName + "_DeltaTime", this.deltaTime.toString());
        localStorage.setItem(this._appName + "_Remember", remember == true ? "true" : "false");
        if (remember == false)
            return;
        localStorage.setItem(this._appName + "_AccessToken", this._accessToken);
        localStorage.setItem(this._appName + "_UserId", this._userId);
        localStorage.setItem(this._appName + "_Username", this._userName);
        localStorage.setItem(this._appName + "_DeltaTime", this.deltaTime.toString());
    }
    getLoginData(apiKey) {
        if (apiKey) {
            // Sanity check
            this.resetLoginData();
            // INFO: By design ApiKey is never persistent
            this._apiKey = apiKey;
            return;
        }
        this._apiKey = null;
        this._accessToken = sessionStorage.getItem(this._appName + "_AccessToken");
        this._userId = sessionStorage.getItem(this._appName + "_UserId");
        this._userName = sessionStorage.getItem(this._appName + "_Username");
        this.deltaTime = parseInt(sessionStorage.getItem(this._appName + "_DeltaTime"));
        if (this.remember == false)
            return;
        this._accessToken = localStorage.getItem(this._appName + "_AccessToken");
        this._userId = localStorage.getItem(this._appName + "_UserId");
        this._userName = localStorage.getItem(this._appName + "_Username");
        this.deltaTime = parseInt(localStorage.getItem(this._appName + "_DeltaTime"));
    }
    get apiKey() {
        return this._apiKey;
    }
    get accessToken() {
        return this._accessToken;
    }
    get isLoggedIn() {
        if (this.apiKey)
            return true;
        if (!this.accessToken)
            return false;
        const accountUserDataRaw = jwtDecode(this.accessToken);
        let dateNow = new Date();
        let dateNowN = Math.floor(dateNow.getTime() / 1000);
        if (accountUserDataRaw.exp < Math.floor(dateNow.getTime() / 1000))
            return false;
        return true;
    }
    get remember() {
        return localStorage.getItem(this._appName + "_Remember") == "true" ? true : false;
    }
    login(username, password, remember) {
        return __awaiter(this, void 0, void 0, function* () {
            this._apiKey = null;
            this.resetLoginData();
            const accountUserData = yield this.accountDataContext.login({ username, password });
            this.setLoginData(accountUserData, remember);
            return accountUserData;
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.accountDataContext.logout();
            }
            finally {
                this._apiKey = null;
                this.resetLoginData();
            }
        });
    }
}
exports.AccountManager = AccountManager;


/***/ }),

/***/ "./src/helpers.ts":
/*!************************!*\
  !*** ./src/helpers.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __webpack_require__(/*! axios */ "axios");
// INFO: It is a wrapper for "axios" to abort Http calls
class HttpRequestCanceler {
    constructor() {
        this.cancelerToken = null;
        this.executor = null;
        this.reset();
    }
    cancel() {
        if (this.executor)
            this.executor();
    }
    reset() {
        this.executor = null;
        this.cancelerToken = new axios_1.default.CancelToken((c) => {
            this.executor = c;
        });
    }
}
exports.HttpRequestCanceler = HttpRequestCanceler;
class Helpers {
    static getRangeItemsFromResponse(response) {
        //TODO: It's very common find "response.headers" syntax so for now is good
        var contentRange = response.headers["content-range"];
        var top = 0;
        var skip = 0;
        var totalItems = 0;
        if (contentRange) {
            var arr1 = contentRange.split("/");
            if (arr1.length != 0) {
                var arr2 = arr1[0].split(" ");
                if (arr2.length == 2) {
                    var arr3 = arr2[1].split("-");
                    if (arr3.length == 2) {
                        top = parseInt(arr3[0]);
                        skip = parseInt(arr3[1]);
                    }
                }
                if (arr1.length == 2)
                    totalItems = parseInt(arr1[1]);
            }
        }
        return {
            top: top,
            skip: skip,
            totalItems: totalItems
        };
    }
}
exports.Helpers = Helpers;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const promise_prototype_finally_1 = __webpack_require__(/*! promise.prototype.finally */ "./node_modules/promise.prototype.finally/index.js");
promise_prototype_finally_1.shim(); //https://stackoverflow.com/questions/35876549/typescript-type-definition-for-promise-prototype-finally
__export(__webpack_require__(/*! ../../common/src/thConstants */ "../common/src/thConstants.js"));
__export(__webpack_require__(/*! ../../common/src/dtos */ "../common/src/dtos.js"));
__export(__webpack_require__(/*! ./realtimeConnectors */ "./src/realtimeConnectors.ts"));
__export(__webpack_require__(/*! ./helpers */ "./src/helpers.ts"));
__export(__webpack_require__(/*! ./accountDataContext */ "./src/accountDataContext.ts"));
__export(__webpack_require__(/*! ./accountManager */ "./src/accountManager.ts"));
__export(__webpack_require__(/*! ./thing */ "./src/thing.ts"));
__export(__webpack_require__(/*! ./thingsDataContext */ "./src/thingsDataContext.ts"));
__export(__webpack_require__(/*! ./thingsManager */ "./src/thingsManager.ts"));


/***/ }),

/***/ "./src/realtimeConnectors.ts":
/*!***********************************!*\
  !*** ./src/realtimeConnectors.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __webpack_require__(/*! axios */ "axios");
const socketIo = __webpack_require__(/*! socket.io-client */ "socket.io-client");
var RealtimeConnectionStates;
(function (RealtimeConnectionStates) {
    RealtimeConnectionStates[RealtimeConnectionStates["Connecting"] = 0] = "Connecting";
    RealtimeConnectionStates[RealtimeConnectionStates["Connected"] = 1] = "Connected";
    RealtimeConnectionStates[RealtimeConnectionStates["Reconnecting"] = 2] = "Reconnecting";
    RealtimeConnectionStates[RealtimeConnectionStates["Disconnected"] = 4] = "Disconnected";
})(RealtimeConnectionStates = exports.RealtimeConnectionStates || (exports.RealtimeConnectionStates = {}));
class RealtimeConnector {
    constructor(url, authHook, errorHook, connectErrorHook, stateChangedHook) {
        this.connectionStatus = 4 /* Disconnected */;
        this.url = ""; //   https://servername:port/route
        this.authHook = null;
        this.errorHook = null;
        this.stateChangedHook = null;
        this.connectErrorHook = null;
        this.url = url;
        this.authHook = authHook;
        this.errorHook = errorHook;
        this.connectErrorHook = connectErrorHook;
        this.stateChangedHook = stateChangedHook;
    }
    on_connectionStatusChange(newState) {
        if (this.connectionStatus == newState)
            return;
        this.connectionStatus = newState;
        this.stateChangedHook(newState);
    }
    subscribe() { }
    unsubscribe() { }
    setHook(eventName, hook) { }
    remHook(eventName, hook) { }
    api() {
        return axios_1.default.get(this.url + "/api")
            .then((response) => { return response; });
    }
}
exports.RealtimeConnector = RealtimeConnector;
class SocketIORealtimeConnector extends RealtimeConnector {
    constructor(url, authHook, errorHook, connectErrorHook, stateChangedHook) {
        super(url, authHook, errorHook, connectErrorHook, stateChangedHook);
        this.socket = null;
    }
    on_error(error) {
        if (this.errorHook)
            this.errorHook(error);
    }
    on_connect_error(error) {
        if (this.connectErrorHook)
            this.connectErrorHook(error);
    }
    on_connect() {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(1 /* Connected */);
    }
    on_disconnect(reason) {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(4 /* Disconnected */);
    }
    subscribe() {
        if (this.socket)
            return;
        let fullUrl = this.url + "?" + this.authHook();
        this.socket = socketIo(fullUrl);
        this.socket.on("error", error => this.on_error(error));
        this.socket.on("connect_error", error => this.on_connect_error(error));
        this.socket.on("connect", () => this.on_connect());
        this.socket.on("disconnect", reason => this.on_disconnect(reason));
    }
    unsubscribe() {
        if (!this.socket)
            return;
        this.socket.disconnect();
        this.socket = null;
    }
    setHook(eventName, hook) {
        this.socket.on(eventName, hook);
    }
    remHook(eventName, hook) {
        // Could happen after unsubscribe so this.socket is null
        if (!this.socket)
            return;
        this.socket.off(eventName, hook);
    }
}
exports.SocketIORealtimeConnector = SocketIORealtimeConnector;


/***/ }),

/***/ "./src/thing.ts":
/*!**********************!*\
  !*** ./src/thing.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Thing {
    constructor(thingDTO) {
        this.childrenSkip = 0;
        this.childrenTotalItems = Number.MAX_SAFE_INTEGER;
        this.children = [];
        this.id = "";
        this.name = "";
        this.kind = "";
        this.pos = 0;
        this.deletedStatus = 0 /* NoMatter */;
        this.publicReadClaims = 0 /* NoClaims */;
        this.publicChangeClaims = 0 /* NoClaims */;
        this.everyoneReadClaims = 0 /* NoClaims */;
        this.everyoneChangeClaims = 0 /* NoClaims */;
        this.userStatus = 0 /* NoMatter */;
        this.userRole = 0 /* NoMatter */;
        this.userVisibility = 0 /* NoMatter */;
        this.userReadClaims = 0 /* NoClaims */;
        this.userChangeClaims = 0 /* NoClaims */;
        this.usersInfos = [];
        this.value = {};
        if (thingDTO) {
            Object.assign(this, thingDTO);
            if (thingDTO.value)
                this.value = thingDTO.value;
        }
    }
    addThingChild(thingChildDTO) {
        this.children.unshift(new Thing(thingChildDTO));
    }
    collapse() {
        this.childrenSkip = 0;
        // INFO: Not reset "this.childrenTotalItems = Number.MAX_SAFE_INTEGER" to trace potential Children number
        // this.childrenTotalItems = Number.MAX_SAFE_INTEGER;
        // INFO: Useful to maintain original internal array ref
        this.children.splice(0, this.children.length);
    }
    shallowCopy() {
        let copyThing = new Thing();
        Object.assign(copyThing, this);
        return copyThing;
    }
}
exports.Thing = Thing;


/***/ }),

/***/ "./src/thingsDataContext.ts":
/*!**********************************!*\
  !*** ./src/thingsDataContext.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __webpack_require__(/*! axios */ "axios");
const helpers_1 = __webpack_require__(/*! ./helpers */ "./src/helpers.ts");
class ThingsDataContext {
    constructor(endPointAddress, securityHeaderHook) {
        this.apiEndPointAddress = "";
        this.securityHeaderHook = null;
        this.apiEndPointAddress = endPointAddress.api;
        this.securityHeaderHook = securityHeaderHook;
    }
    thingsUrl(thingId) {
        return this.apiEndPointAddress + "/things/" + (thingId || "");
    }
    thingsValueUrl(thingId) {
        return this.apiEndPointAddress + "/things/" + thingId + "/value";
    }
    thingsCmdUrl(thingId) {
        return this.apiEndPointAddress + "/things/" + thingId + "/cmd";
    }
    thingsPositionsUrl() {
        return this.apiEndPointAddress + "/things/positions";
    }
    thingChildrenUrl(parentThingId, childrenId) {
        return this.apiEndPointAddress + "/things/" + (parentThingId) + "/childrenIds/" + (childrenId || "");
    }
    thingDeleteChildUrl(parentThingId, childThingId) {
        return this.apiEndPointAddress + "/things/" + parentThingId + "/childrenIds/" + childThingId;
    }
    getThing(thingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(this.thingsUrl(thingId), {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    // INFO: To abort call "canceler.cancel()"
    getThings(parameter, canceler) {
        var urlRaw = this.thingsUrl() + "?" +
            (!!parameter.parentThingId ? ("&parentThingId=" + parameter.parentThingId) : "") +
            (!!parameter.thingFilter ? ("&thingFilter=" + JSON.stringify(parameter.thingFilter)) : "") +
            (!!parameter.valueFilter ? ("&valueFilter=" + JSON.stringify(parameter.valueFilter)) : "") +
            (!!parameter.orderBy ? ("&orderBy=" + parameter.orderBy) : "") +
            (!!parameter.skip ? ("&skip=" + parameter.skip) : "") +
            (!!parameter.top ? ("&top=" + parameter.top) : "");
        return axios_1.default.get(urlRaw, {
            headers: this.securityHeaderHook(),
            cancelToken: (canceler) ? canceler.cancelerToken : null
        })
            .then(function (response) {
            return {
                things: response.data,
                itemsRange: helpers_1.Helpers.getRangeItemsFromResponse(response)
            };
        })
            .catch(function (response) {
            // ToDo: response in undefined if request was cancelled
            if (axios_1.default.isCancel(response)) {
                console.log('Request canceled', response.message);
            }
            throw (response);
        })
            .finally(function () {
        });
    }
    // TOCHECK: Check Returned data
    createThing(ThingDTO) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(this.thingsUrl(), ThingDTO, {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    updateThing(thingId, ThingDTO) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.put(this.thingsUrl(thingId), ThingDTO, {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    deleteThing(thingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.delete(this.thingsUrl(thingId), {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    getThingChildrenIds(parentThingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(this.thingChildrenUrl(parentThingId), {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    addChildToParent(parentThingId, childThingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.post(this.thingChildrenUrl(parentThingId), JSON.stringify(childThingId), {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    deleteThingChild(parentThingId, childThingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.delete(this.thingDeleteChildUrl(parentThingId, childThingId), {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    getThingValue(thingId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(this.thingsValueUrl(thingId), {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    putThingValue(thingId, asCmd, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = asCmd ? this.thingsCmdUrl(thingId) : this.thingsValueUrl(thingId);
            const response = yield axios_1.default.put(url, value, {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
    // TOCHECK: Check Returned data
    putThingsPositions(positions) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.put(this.thingsPositionsUrl(), positions, {
                headers: this.securityHeaderHook()
            });
            return response.data;
        });
    }
}
exports.ThingsDataContext = ThingsDataContext;


/***/ }),

/***/ "./src/thingsManager.ts":
/*!******************************!*\
  !*** ./src/thingsManager.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = __webpack_require__(/*! . */ "./src/index.ts");
class ThingsManager {
    constructor(mainThing, thingKind, thingClaims, thingsDataContext, realtimeConnector) {
        this.mainThing = mainThing;
        this.thingKind = thingKind;
        this.thingClaims = thingClaims;
        this.thingsDataContext = thingsDataContext;
        this.realtimeConnector = realtimeConnector;
        this.onCreateThing = (thingDTO) => {
            if (thingDTO.kind === this.thingKind) {
                this.mainThing.addThingChild(thingDTO);
                return;
            }
        };
        this.onUpdateThingValue = (thingId, value, asCmd) => {
            let thing = this.searchThingById(thingId);
            if (!thing)
                return;
            if (asCmd)
                return;
            thing.value = value;
        };
        this.getThingsParams = {
            // Viene sovrascritto da thingsManager
            // Override by thingsManager
            parentThingId: null,
            thingFilter: { $and: [{ kind: this.thingKind }, { deletedStatus: 1 /* Ok */ }] },
            top: 10,
            skip: 0,
            orderBy: null,
            valueFilter: null
        };
        this.getChindrenThingsParams = {
            // Viene sovrascritto da thingsManager
            parentThingId: null,
            thingFilter: { deletedStatus: 1 /* Ok */ },
            top: 10,
            // Viene sovrascritto da thingsManager
            skip: 0,
            orderBy: null,
            valueFilter: null
        };
    }
    init() {
        this.realtimeConnector.setHook("onCreateThing", this.onCreateThing);
        this.realtimeConnector.setHook("onUpdateThingValue", this.onUpdateThingValue);
    }
    done() {
        this.realtimeConnector.remHook("onUpdateThingValue", this.onUpdateThingValue);
        this.realtimeConnector.remHook("onCreateThing", this.onCreateThing);
    }
    searchThingById(id) {
        return this.mainThing.children.find((thing) => {
            return thing.id === id;
        });
    }
    // INFO: Does not change mainThing
    getThings(parameter, canceler) {
        return __awaiter(this, void 0, void 0, function* () {
            let thingsDTOsDataSet = null;
            let things = [];
            try {
                thingsDTOsDataSet = yield this.thingsDataContext.getThings(parameter, canceler);
                for (let i = 0; i < thingsDTOsDataSet.things.length; i++) {
                    var thing = new _1.Thing(thingsDTOsDataSet.things[i]);
                    things.push(thing);
                }
            }
            catch (e) {
                throw e;
            }
            return {
                things: things,
                itemsRange: thingsDTOsDataSet.itemsRange
            };
        });
    }
    // INFO: Fills parentThing
    // INFO: Does not change mainThing, but parentThing is changed    
    // INFO: "parameter" is changed
    getMoreThingChildren(parentThing, parameter, canceler) {
        return __awaiter(this, void 0, void 0, function* () {
            parameter.skip = parentThing.childrenSkip;
            parameter.parentThingId = parentThing.id;
            const thingsDataSet = yield this.getThings(parameter, canceler);
            parentThing.childrenTotalItems = thingsDataSet.itemsRange.totalItems;
            parentThing.childrenSkip = parentThing.childrenSkip + parameter.top;
            //  Fix range
            if (parentThing.childrenSkip > parentThing.childrenTotalItems)
                parentThing.childrenSkip = parentThing.childrenTotalItems;
            for (var i = 0; i < thingsDataSet.things.length; i++)
                parentThing.children.push(thingsDataSet.things[i]);
            return thingsDataSet;
        });
    }
    // INFO:    In Books example where "this.mainThing" is a "generic root thing" 
    //          "getMoreThings" fills "this.mainThing.children" with "books" collection 
    //          and "this.mainThing.children[0..n].children" with "generic root thing" like "book comments" collection
    getMoreThings(canceler) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            var data = yield this.getMoreThingChildren(this.mainThing, this.getThingsParams, canceler);
            let promises = [];
            // Try to get all things children
            for (let i = 0; i < data.things.length; i++)
                promises.push(self.getMoreThingChildren(data.things[i], self.getChindrenThingsParams, canceler));
            Promise.all(promises);
        });
    }
    getThingsTotalItems() {
        return this.mainThing.childrenTotalItems;
    }
    // Only a wrapper
    putThingValue(thingId, asCmd, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.thingsDataContext.putThingValue(thingId, asCmd, value);
        });
    }
}
exports.ThingsManager = ThingsManager;


/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_axios__;

/***/ }),

/***/ "socket.io-client":
/*!**********************************************************************************************************************************!*\
  !*** external {"amd":"socket.io-client","global":"io","root":"io","commonjs":"socket.io-client","commonjs2":"socket.io-client"} ***!
  \**********************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_socket_io_client__;

/***/ })

/******/ });
});
//# sourceMappingURL=thingshub.js.map