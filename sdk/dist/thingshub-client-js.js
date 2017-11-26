var ThingsHubClient =
/******/ (function(modules) { // webpackBootstrap
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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
const ThingUserRole = {
	NoMatter      : 0,  // Internal state. Do not use for external use like filter
	Administrator : 1,
	User          : 2
};
exports.ThingUserRole = ThingUserRole;

exports.validateThingUserRole = function validateThingUserRole(userRole) {
	switch(userRole) {
	case ThingUserRole.NoMatter:
	case ThingUserRole.Administrator:
	case ThingUserRole.User:
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
	NoClaim: 0,

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

// Do not have validation function since are bitwise values
const ThingUserChangeClaims = {
	NoClaim: 0,

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

exports.ThingKind = {
	NoMatter: "0",
	genericId : "1",
	genericTxt : "the bees are laborious"
};

const DefaultThingPos = Number.MAX_SAFE_INTEGER;
exports.DefaultThingPos = DefaultThingPos;




/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = axios;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __webpack_require__(1);
// INFO: It is a wrapper for "axios" to abort Http calls
var HttpRequestCanceler = /** @class */ (function () {
    function HttpRequestCanceler() {
        this.cancelerToken = null;
        this.executor = null;
    }
    HttpRequestCanceler.prototype.setup = function () {
        var _this = this;
        if (this.cancelerToken === null) {
            this.cancelerToken = new axios_1.default.CancelToken(function (c) {
                _this.executor = c;
            });
        }
    };
    // INFO:    Maybe not useful
    HttpRequestCanceler.prototype.reset = function () {
        this.executor = null;
        this.cancelerToken = null;
    };
    HttpRequestCanceler.prototype.cancel = function () {
        if (this.executor)
            this.executor();
        this.reset();
    };
    return HttpRequestCanceler;
}());
exports.HttpRequestCanceler = HttpRequestCanceler;
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Object.defineProperty(Helpers, "securityHeaders", {
        get: function () {
            return {};
        },
        enumerable: true,
        configurable: true
    });
    Helpers.getRangeItemsFromResponse = function (response) {
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
    };
    return Helpers;
}());
exports.Helpers = Helpers;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(4));
__export(__webpack_require__(0));
__export(__webpack_require__(5));
__export(__webpack_require__(2));
__export(__webpack_require__(7));
__export(__webpack_require__(8));


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const constants = __webpack_require__(0);

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
		this.username = "";
		this.emails = [];
  
		if (!fullInfos) {
			return;
		}
  
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
		
		this.kind = constants.ThingKind.generic;
		
		this.pos = 0;// Not used during creation or updating of thing
		
		this.deletedStatus = constants.ThingDeletedStates.NoMatter;
		this.deletedDate = null;
		
		this.publicReadClaims = constants.ThingUserReadClaims.NoClaim;
		this.publicChangeClaims = constants.ThingUserChangeClaims.NoClaim;
		
		this.everyoneReadClaims = constants.ThingUserReadClaims.NoClaim;
		this.everyoneChangeClaims = constants.ThingUserChangeClaims.NoClaim;
		
		this.value = {};
		
		this.userStatus = constants.ThingUserStates.NoMatter;
		this.userRole = constants.ThingUserRole.NoMatter;
		this.userVisibility = constants.ThingUserVisibility.NoMatter;
		
		this.userReadClaims = constants.ThingUserReadClaims.NoClaim;
		this.userChangeClaims = constants.ThingUserChangeClaims.NoClaim;
		
		this.usersInfos = []; // Not used during creation or updating of thing
	}
}
exports.ThingDTO = ThingDTO;





/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __webpack_require__(1);
var socketIo = __webpack_require__(6);
var ConnectionStates;
(function (ConnectionStates) {
    ConnectionStates[ConnectionStates["Connecting"] = 0] = "Connecting";
    ConnectionStates[ConnectionStates["Connected"] = 1] = "Connected";
    ConnectionStates[ConnectionStates["Reconnecting"] = 2] = "Reconnecting";
    ConnectionStates[ConnectionStates["Disconnected"] = 4] = "Disconnected";
})(ConnectionStates = exports.ConnectionStates || (exports.ConnectionStates = {}));
var Connector = /** @class */ (function () {
    function Connector(url, authHook, errorHook, connectErrorHook, stateChangedHook) {
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
    Connector.prototype.on_connectionStatusChange = function (newState) {
        if (this.connectionStatus == newState)
            return;
        this.connectionStatus = newState;
        this.stateChangedHook(newState);
    };
    Connector.prototype.subscribe = function () { };
    Connector.prototype.unsubscribe = function () { };
    Connector.prototype.setHook = function (eventName, hook) { };
    Connector.prototype.remHook = function (eventName, hook) { };
    Connector.prototype.api = function () {
        return axios_1.default.get(this.url + "/api")
            .then(function (response) { return response; });
    };
    return Connector;
}());
exports.Connector = Connector;
var SocketIOConnector = /** @class */ (function (_super) {
    __extends(SocketIOConnector, _super);
    function SocketIOConnector(url, authHook, errorHook, connectErrorHook, stateChangedHook) {
        var _this = _super.call(this, url, authHook, errorHook, connectErrorHook, stateChangedHook) || this;
        _this.socket = null;
        return _this;
    }
    SocketIOConnector.prototype.on_error = function (error) {
        if (this.errorHook)
            this.errorHook(error);
    };
    SocketIOConnector.prototype.on_connect_error = function (error) {
        if (this.connectErrorHook)
            this.connectErrorHook(error);
    };
    SocketIOConnector.prototype.on_connect = function () {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(1 /* Connected */);
    };
    SocketIOConnector.prototype.on_disconnect = function (reason) {
        if (this.on_connectionStatusChange)
            this.on_connectionStatusChange(4 /* Disconnected */);
    };
    SocketIOConnector.prototype.subscribe = function () {
        var _this = this;
        if (this.socket)
            return;
        var fullUrl = this.url + "?" + this.authHook();
        this.socket = socketIo(fullUrl);
        this.socket.on("error", function (error) { return _this.on_error(error); });
        this.socket.on("connect_error", function (error) { return _this.on_connect_error(error); });
        this.socket.on("connect", function () { return _this.on_connect(); });
        this.socket.on("disconnect", function (reason) { return _this.on_disconnect(reason); });
    };
    SocketIOConnector.prototype.unsubscribe = function () {
        if (!this.socket)
            return;
        this.socket.disconnect();
    };
    SocketIOConnector.prototype.setHook = function (eventName, hook) {
        this.socket.on(eventName, hook);
    };
    SocketIOConnector.prototype.remHook = function (eventName, hook) {
        this.socket.off(eventName, hook);
    };
    return SocketIOConnector;
}(Connector));
exports.SocketIOConnector = SocketIOConnector;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = io;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var thingConstants = __webpack_require__(0);
var Thing = /** @class */ (function () {
    function Thing(thingDTO) {
        this.childrenSkip = 0;
        this.childrenTotalItems = Number.MAX_SAFE_INTEGER;
        this.children = [];
        this.id = "";
        this.name = "";
        this.kind = "";
        this.pos = 0;
        this.deletedStatus = thingConstants.ThingDeletedStatus.NoMatter;
        this.publicReadClaims = thingConstants.ThingUserReadClaims.NoClaims;
        this.publicChangeClaims = thingConstants.ThingUserChangeClaims.NoClaims;
        this.everyoneReadClaims = thingConstants.ThingUserReadClaims.NoClaims;
        this.everyoneChangeClaims = thingConstants.ThingUserChangeClaims.NoClaims;
        this.userStatus = thingConstants.ThingUserStatus.NoMatter;
        this.userRole = thingConstants.ThingUserRoles.NoMatter;
        this.userVisibility = thingConstants.ThingUserVisibility.NoMatter;
        this.userReadClaims = thingConstants.ThingUserReadClaims.NoClaims;
        this.userChangeClaims = thingConstants.ThingUserChangeClaims.NoClaims;
        this.usersInfos = [];
        this.value = {};
        if (thingDTO) {
            Object.assign(this, thingDTO);
            if (thingDTO.value)
                this.value = JSON.parse(thingDTO.value);
        }
    }
    Thing.prototype.addThingChild = function (thingChildDTO) {
        this.children.unshift(new Thing(thingChildDTO));
    };
    Thing.prototype.collapse = function () {
        this.childrenSkip = 0;
        // INFO: Not reset "this.childrenTotalItems = Number.MAX_SAFE_INTEGER" to trace potential Children number
        // this.childrenTotalItems = Number.MAX_SAFE_INTEGER;
        // INFO: Useful to maintain original internal array ref
        this.children.splice(0, this.children.length);
    };
    Thing.prototype.shallowCopy = function () {
        var copyThing = new Thing();
        Object.assign(copyThing, this);
        return copyThing;
    };
    return Thing;
}());
exports.Thing = Thing;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __webpack_require__(1);
var helpers_1 = __webpack_require__(2);
var ThingsDataContext = /** @class */ (function () {
    function ThingsDataContext() {
    }
    ThingsDataContext.thingsUrl = function (thingId) {
        return ThingsDataContext.apiEndPointAddress + "/things/" + (thingId || "");
    };
    ThingsDataContext.thingsValueUrl = function (thingId) {
        return ThingsDataContext.apiEndPointAddress + "/things/" + thingId + "/value";
    };
    ThingsDataContext.thingsPositionsUrl = function () {
        return ThingsDataContext.apiEndPointAddress + "/things/positions";
    };
    ThingsDataContext.thingChildrenUrl = function (parentThingId, childrenId) {
        return ThingsDataContext.apiEndPointAddress + "/things/" + (parentThingId) + "/childrenIds/" + (childrenId || "");
    };
    ThingsDataContext.thingDeleteChildUrl = function (parentThingId, childThingId) {
        return ThingsDataContext.apiEndPointAddress + "/things/" + parentThingId + "/childrenIds/" + childThingId;
    };
    // INFO: Is mandatory call "init"" before the use of this class
    ThingsDataContext.init = function (endPointAddress) {
        ThingsDataContext.apiEndPointAddress = endPointAddress.api;
    };
    ThingsDataContext.getThing = function (thingId) {
        return axios_1.default.get(ThingsDataContext.thingsUrl(thingId), {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    // INFO: To abort call "canceler.cancel()"
    ThingsDataContext.getThings = function (parameter, canceler) {
        var urlRaw = ThingsDataContext.thingsUrl() + "?" +
            (!!parameter.parentThingId ? ("&$parentId=" + parameter.parentThingId) : "") +
            (!!parameter.thingFilter ? ("&$thingFilter=" + parameter.thingFilter) : "") +
            (!!parameter.valueFilter ? ("&$valueFilter=" + parameter.valueFilter) : "") +
            (!!parameter.orderBy ? ("&$orderby=" + parameter.orderBy) : "") +
            (!!parameter.skip ? ("&$skip=" + parameter.skip) : "") +
            (!!parameter.top ? ("&$top=" + parameter.top) : "");
        if (canceler)
            canceler.setup();
        return axios_1.default.get(urlRaw, {
            headers: helpers_1.Helpers.securityHeaders,
            cancelToken: (canceler) ? canceler.cancelerToken : null
        })
            .then(function (response) {
            return {
                things: response.data,
                itemsRange: helpers_1.Helpers.getRangeItemsFromResponse(response)
            };
        })
            .finally(function () {
            /*
            if (canceler)
                canceler.reset();
            */
        });
    };
    // TOCHECK: Check Returned data
    ThingsDataContext.createThing = function (ThingDTO) {
        return axios_1.default.post(ThingsDataContext.thingsUrl(), ThingDTO, {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    // TOCHECK: Check Returned data
    ThingsDataContext.updateThing = function (thingId, ThingDTO) {
        return axios_1.default.put(ThingsDataContext.thingsUrl(thingId), ThingDTO, {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    // TOCHECK: Check Returned data
    ThingsDataContext.deleteThing = function (thingId) {
        return axios_1.default.delete(ThingsDataContext.thingsUrl(thingId), {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    // TOCHECK: Check Returned data
    ThingsDataContext.getThingChildrenIds = function (parentThingId) {
        return axios_1.default.get(ThingsDataContext.thingChildrenUrl(parentThingId), {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    // TOCHECK: Check Returned data
    ThingsDataContext.addChildToParent = function (parentThingId, childThingId) {
        return axios_1.default.post(ThingsDataContext.thingChildrenUrl(parentThingId), JSON.stringify(childThingId), {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    // TOCHECK: Check Returned data
    ThingsDataContext.deleteThingChild = function (parentThingId, childThingId) {
        return axios_1.default.delete(ThingsDataContext.thingDeleteChildUrl(parentThingId, childThingId), {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    ThingsDataContext.getThingValue = function (thingId, value) {
        return axios_1.default.get(ThingsDataContext.thingsValueUrl(thingId), {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    ThingsDataContext.putThingValue = function (thingId, value) {
        return axios_1.default.put(ThingsDataContext.thingsValueUrl(thingId), value, {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    // TOCHECK: Check Returned data
    ThingsDataContext.putThingsPositions = function (positions) {
        return axios_1.default.put(ThingsDataContext.thingsPositionsUrl(), positions, {
            headers: helpers_1.Helpers.securityHeaders
        })
            .then(function (response) {
            return response.data;
        });
    };
    ThingsDataContext.apiEndPointAddress = "";
    return ThingsDataContext;
}());
exports.ThingsDataContext = ThingsDataContext;


/***/ })
/******/ ]);
//# sourceMappingURL=thingshub-client-js.js.map