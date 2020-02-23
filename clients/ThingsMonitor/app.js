const readline = require('readline');
const path = require("path");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
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
const globalConfig = {
  disconnectionTimeout: 10000, // milliseconds
  interval2: 2*60*1000, // 2 minutes
  emails: ["cmcampione@gmail.com"],
}
const globalConfigStatus = {
  lastConnection: Date.now(),
  timeoutForDisconnection: null,
  disconnectionEmailSent: false
}

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: (process.env.SMTP_SECURE === "true"), // secure:true for port 465, secure:false for port 587
  requireTLS: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_USER_PASSWORD,
  },
});

//
const accountDataContext = new thingshub.AccountDataContext(endPoint);
const accountManager = new thingshub.AccountManager("thingshub", accountDataContext, mainApiKey);

function onError(error) {
  console.log(error);
}
function onConnectError(error) {
  console.log(error);
}

async function SendNotificationEmailForDisconnection(emails, interval1, interval2, culture) {

  // ToDo: Fix correct culture
  culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}

  // Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/disconnectionEmail-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
      email : process.env.SUPPORT_EMAIL,
      interval1: Math.round(interval1 / 1000),
      interval2: interval2 / 1000 / 60
		}, (err, renderedHtml) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(renderedHtml);
		});
	});

	// setup email data with unicode symbols
	const mailOptions = {
		from: process.env.NOTIFICATION_EMAIL_FROM, // sender address
		to: emails, // list of receivers
		subject, // Subject line
		text: "", // plain text body
		html, // html body
	};

  // Send email
	return new Promise((resolve, reject) => {
		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				reject(error);
				return error;
			}
			resolve(info);
			return info;
		});
	});
}

const onStateChanged = (change) => {
  switch (change) {
    case thingshub.RealtimeConnectionStates.Disconnected: {
      let interval1 = Date.now() - globalConfigStatus.lastConnection;
      if (interval1 > globalConfig.disconnectionTimeout) {
        globalConfigStatus.timeoutForDisconnection = setTimeout(
          async () => {
            try {
              await SendNotificationEmailForDisconnection(globalConfig.emails, interval1, globalConfig.interval2);
              globalConfigStatus.disconnectionEmailSent = true;
              globalConfigStatus.timeoutForDisconnection = null;
            } catch(e) {
              console.log(e);
          }
        }, 
        globalConfig.disconnectionTimeout);
      }
      break;
    }
    case thingshub.RealtimeConnectionStates.Connected: {
      globalConfigStatus.lastConnection = Date.now();
      if (globalConfigStatus.timeoutForDisconnection) {
        clearTimeout(globalConfigStatus.timeoutForDisconnection);
        globalConfigStatus.timeoutForDisconnection = null;
      }
      if (globalConfigStatus.disconnectionEmailSent) {
        // SendNotificationEmailForReconnection(emails);
        globalConfigStatus.disconnectionEmailSent = false;
      }
      break;
    }
    case thingshub.RealtimeConnectionStates.Connecting: {
      break;
    }
    case thingshub.RealtimeConnectionStates.Reconnecting: {
      break;
    }
  }
};

function onAPI(data) {
  console.log(data);
}

function onUpdateThing(thingDTO) {
  console.log(thingDTO);
}
function onUpdateThingValue(thingId, value, asCmd) {
  console.log(value);
}

var realTimeConnector = new thingshub.SocketIORealtimeConnector(endPoint.server, 
  accountManager.getSecurityToken, 
  onError, onConnectError, onStateChanged);
realTimeConnector.subscribe();
realTimeConnector.setHook("api", onAPI);
realTimeConnector.setHook("onUpdateThing", onUpdateThing);
realTimeConnector.setHook("onUpdateThingValue", onUpdateThingValue);

// Test realtime connection
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

//
readline.emitKeypressEvents(process.stdin);
//process.stdin.setRawMode(true);
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
