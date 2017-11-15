System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ConnectionState, Connector, SocketIOConnector;
    return {
        setters: [],
        execute: function () {
            (function (ConnectionState) {
                ConnectionState[ConnectionState["Connecting"] = 0] = "Connecting";
                ConnectionState[ConnectionState["Connected"] = 1] = "Connected";
                ConnectionState[ConnectionState["Reconnecting"] = 2] = "Reconnecting";
                ConnectionState[ConnectionState["Disconnected"] = 4] = "Disconnected";
            })(ConnectionState || (ConnectionState = {}));
            exports_1("ConnectionState", ConnectionState);
            Connector = class Connector {
                constructor(url, authHook, stateChangedHook, reconnectedHook, subscribeSuccessHook, subscribeFailHook) {
                    this.authHook = null;
                    this.stateChangedHook = null;
                    this.reconnectedHook = null;
                    this.subscribeSuccessHook = null;
                    this.subscribeFailHook = null;
                    this.authHook = authHook;
                    this.stateChangedHook = stateChangedHook;
                    this.reconnectedHook = reconnectedHook;
                    this.subscribeSuccessHook = subscribeSuccessHook;
                    this.subscribeFailHook = subscribeFailHook;
                }
                subscribe() { }
                unsubscribe() { }
                setHook(eventName, hook) { }
                remHook(eventName, hook) { }
            };
            exports_1("Connector", Connector);
            SocketIOConnector = class SocketIOConnector extends Connector {
                constructor(url, authHook, stateChangedHook, reconnectedHook, subscribeSuccessHook, subscribeFailHook) {
                    super(url, authHook, stateChangedHook, reconnectedHook, subscribeSuccessHook, subscribeFailHook);
                    this.socket = null;
                }
            };
            exports_1("SocketIOConnector", SocketIOConnector);
        }
    };
});
//# sourceMappingURL=connector.js.map