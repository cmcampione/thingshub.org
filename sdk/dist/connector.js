System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var ConnectionState, Dummy;
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
            Dummy = class Dummy {
                dummy() {
                    return 1 /* Connected */;
                }
            };
            exports_1("Dummy", Dummy);
        }
    };
});
//# sourceMappingURL=connector.js.map