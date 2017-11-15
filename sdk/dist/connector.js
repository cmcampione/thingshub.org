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
define(["require", "exports", "socket.io-client"], function (require, exports, socketIo) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConnectionStates;
    (function (ConnectionStates) {
        ConnectionStates[ConnectionStates["Connecting"] = 0] = "Connecting";
        ConnectionStates[ConnectionStates["Connected"] = 1] = "Connected";
        ConnectionStates[ConnectionStates["Reconnecting"] = 2] = "Reconnecting";
        ConnectionStates[ConnectionStates["Disconnected"] = 4] = "Disconnected";
    })(ConnectionStates = exports.ConnectionStates || (exports.ConnectionStates = {}));
    var Connector = /** @class */ (function () {
        function Connector(url, authHook, stateChangedHook, subscribeFailHook) {
            this.connectionStatus = 4 /* Disconnected */;
            this.authHook = null;
            this.url = "";
            this.stateChangedHook = null;
            this.subscribeFailHook = null;
            this.authHook = authHook;
            this.stateChangedHook = stateChangedHook;
            this.subscribeFailHook = subscribeFailHook;
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
        return Connector;
    }());
    exports.Connector = Connector;
    var SocketIOConnector = /** @class */ (function (_super) {
        __extends(SocketIOConnector, _super);
        function SocketIOConnector(url, authHook, stateChangedHook, subscribeFailHook) {
            var _this = _super.call(this, url, authHook, stateChangedHook, subscribeFailHook) || this;
            _this.socket = null;
            return _this;
        }
        SocketIOConnector.prototype.on_error = function (error) {
        };
        SocketIOConnector.prototype.on_connect_error = function (error) {
            this.subscribeFailHook();
        };
        SocketIOConnector.prototype.on_connect = function () {
            this.on_connectionStatusChange(1 /* Connected */);
        };
        SocketIOConnector.prototype.on_disconnect = function (reason) {
            this.on_connectionStatusChange(4 /* Disconnected */);
        };
        SocketIOConnector.prototype.subscribe = function () {
            var _this = this;
            if (this.socket)
                return;
            var fullUrl = this.url + "?" + this.authHook();
            this.socket = socketIo(this.url);
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
        return SocketIOConnector;
    }(Connector));
    exports.SocketIOConnector = SocketIOConnector;
});
//# sourceMappingURL=connector.js.map