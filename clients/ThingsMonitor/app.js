const readline = require('readline');
const path = require("path");
const dotenv = require("dotenv");
const thingshub = require('thingshub-js-sdk');

// Env configuration
const configPath = path.join(__dirname, "./", "thingsMonitor.env");
dotenv.config({ path: configPath });

//
var mainApiKey = process.env.MAIN_API_KEY;
if (!mainApiKey) {
  console.log("Main ApiKey not found in .env file");
  process.exit();
}
const endPoint = {
  server: process.env.ENDPOINT_SERVER,
  api: process.env.ENDPOINT_API
}
if (!endPoint.server || !endPoint.api) {
  console.log("EndPoint data not found in .env file");
  process.exit();
}

let configThingKind = process.env.CONFIG_THING_KIND
if (!configThingKind) {
  console.log("Config Thing Kind not found in .env file");
  process.exit();
}

//
const accountDataContext = new thingshub.AccountDataContext(endPoint);
//
const accountManager = new thingshub.AccountManager("thingshub", accountDataContext, mainApiKey);

function onError(error) {
  console.log(error);
}
function onConnectError(error) {
  console.log(error);
}

function onStateChanged(change) {
  console.log(change);
}

function onAPI(data) {
  console.log(data);
}

function onUpdateThing(thingDTO) {
  console.log(thingDTO);
}
function onUpdateThingValue(thingId, value, asCmd) {
  console.log(value);
}

var realTimeConnector = new thingshub.SocketIORealtimeConnector(endPoint.server, accountManager.getSecurityToken, onError, onConnectError, onStateChanged);
realTimeConnector.subscribe();
realTimeConnector.setHook("api", onAPI);
realTimeConnector.setHook("onUpdateThing", onUpdateThing);
realTimeConnector.setHook("onUpdateThingValue", onUpdateThingValue);

realTimeConnector.api()
.then(function(res) {
  console.log(res);
})
.catch(function(err) {
  console.log(err);
});

// 

var mainThingForConfig = new thingshub.Thing();
var thingsManagerClaims = {

  publicReadClaims : thingshub.ThingUserReadClaims.NoClaims,
  publicChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

  everyoneReadClaims: thingshub.ThingUserReadClaims.NoClaims,
  everyoneChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

  creatorUserReadClaims: thingshub.ThingUserReadClaims.AllClaims,
  creatorUserChangeClaims: thingshub.ThingUserChangeClaims.AllClaims
}
var thingsDatacontext = new thingshub.ThingsDataContext(endPoint, accountManager.getSecurityHeader);
var thingsManager = new thingshub.ThingsManager(mainThingForConfig, configThingKind, thingsManagerClaims, thingsDatacontext, realTimeConnector );
var httpRequestCanceler = new thingshub.HttpRequestCanceler();

thingsManager.getMoreThings(httpRequestCanceler)
    .then((data) => {
      console.log(mainThingForConfig);        
    })
    .catch((e) => {
      console.log(e);
    });

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    console.log('bye');
    process.exit();
  } else {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
  }
});
console.log('Press any key...');
