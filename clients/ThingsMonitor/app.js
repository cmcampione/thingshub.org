const readline = require("readline");
const path = require("path");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const dotenv = require("dotenv");
const thingshub = require("thingshub-js-sdk");

// Env configuration
const configPath = path.join(__dirname, "./", "thingsMonitor.env");
dotenv.config({ path: configPath });

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	secure: (process.env.SMTP_SECURE === "true"), // secure:true for port 465, secure:false for port 587
	requireTLS: false,// ToDo: At home works with true
	tls: {
		rejectUnauthorized: false,
	},
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_USER_PASSWORD,
	},
});

//
var mainApiKey = process.env.MAIN_API_KEY;
if (!mainApiKey) {
	console.log("Main ApiKey not found in .env file");
	process.exit();
}
const endPoint = {
	server: process.env.ENDPOINT_SERVER,
	api: process.env.ENDPOINT_API
};
if (!endPoint.server || !endPoint.api) {
	console.log("EndPoint data not found in .env file");
	process.exit();
}
const configThingKind = process.env.CONFIG_THING_KIND;
if (!configThingKind) {
	console.log("Config Thing Kind not found in .env file");
	process.exit();
}

//
const globalConfig = {
	disconnectionTimeout: 10000, // 10 seconds
	interval2: 2 * 60 * 1000, // 2 minutes
	emails: ["cmcampione@gmail.com"]
};
const globalConfigStatus = {
	isConnected: false,
	timeoutForDisconnection: null,
	sendingDisconnectionEmail: false,
	sendingReconnectionEmail: false,
	disconnectionEmailSent: false
};

//
let ThingsConfigs = null;

//
async function SendAlarmEmailForDelay(emails, thingName, delay, culture) {
	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}

	// Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/alarmEmailForDelay-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			supportemail: process.env.SUPPORT_EMAIL,
			thingName: thingName,
			delay: delay / 1000,
			urlportal: process.env.URL_PORTAL
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
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				reject(err);
				return err;
			}
			resolve(info);
			return info;
		});
	});
}
async function SendReenteredEmailForDelay(emails, thingName, culture) {
	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}

	// Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/alarmEmailForDelay-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			support_email: process.env.SUPPORT_EMAIL,
			thingName: thingName,
			urlportal: process.env.URL_PORTAL
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
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				reject(err);
				return err;
			}
			resolve(info);
			return info;
		});
	});
}
async function checkAlarmForDelay(thingId) {
	if (ThingsConfigs.has(thingId) === false)
		return;
	const thingConfig = ThingsConfigs.get(thingId).config;
	const thingStatus = ThingsConfigs.get(thingId).status;

	// Check alarm for delay
	if (thingStatus.lastOnUpdateThingValueEvent === null || Date.now() - thingStatus.lastOnUpdateThingValueEvent > thingConfig.onUpdateThingValueTimeoutEvent) {
		if (thingStatus.inAlarm === false) {
			console.log("SendAlarmEmailForDelay");
			await SendAlarmEmailForDelay(thingConfig.emails, thingConfig.thingName);
		}
		thingStatus.inAlarm = true;
		return;
	}
	if (thingStatus.inAlarm === true) {
		console.log("SendReenteredEmailForDelay");
		await SendReenteredEmailForDelay(thingConfig.emails, thingConfig.thingName);
		thingStatus.inAlarm = false;
	}
}

ThingsConfigs = new Map([
	["f4c3c80b-d561-4a7b-80a5-f4805fdab9bb", {
		config: {
			configThingId: "fb9071b5-133a-4716-86c6-4e14d798a2d1",
			onUpdateThingValueTimeoutEvent: 10 * 1000, // 10 seconds - Bees pull every 5 seconds		
			emails: ["cmcampione@gmail.com"],
			thingName: "My Home",
			checkInterval: setInterval(async () => {
				await checkAlarmForDelay("f4c3c80b-d561-4a7b-80a5-f4805fdab9bb");
			}, this.onUpdateThingValueTimeoutEvent)
		},
		status: {
			lastOnUpdateThingValueEvent: null,
			lastValue: null,
			inAlarm: false
		},
		// Specific for Home appliance
		sensors: new Map([
			["31669624", {// ToDo: sensorId long or string?
				onUpdateThingValueAlarmValue: true
			}]
		])
	}]
]);

//
const accountDataContext = new thingshub.AccountDataContext(endPoint);
const accountManager = new thingshub.AccountManager("thingshub", accountDataContext, mainApiKey);

function onError(error) {
	// console.log(error);
}
function onConnectError(error) {
	// console.log(error);
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
			supportemail: process.env.SUPPORT_EMAIL,
			interval1: Math.round(interval1 / 1000),
			interval2: interval2 / 1000 / 60,
			urlportal: process.env.URL_PORTAL
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
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				reject(err);
				return err;
			}
			resolve(info);
			return info;
		});
	});
}
async function SendNotificationEmailForReconnection(emails, culture) {
	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}

	// Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/reconnectionEmail-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			supportemail: process.env.SUPPORT_EMAIL,
			urlportal: process.env.URL_PORTAL
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
			return info; // ToDo: Do we need this?
		});
	});
}
const onStateChanged = async (change) => {
	switch (change) {
	case thingshub.RealtimeConnectionStates.Disconnected: {
		console.log("Disconnected");
		globalConfigStatus.isConnected = false;
		globalConfigStatus.timeoutForDisconnection = setInterval(
			async () => {
				console.log("In timeout");
				try {
					if (globalConfigStatus.sendingDisconnectionEmail) {
						return; // Timer is sending DisconnectionEmail
					}
					if (globalConfigStatus.disconnectionEmailSent === false) {
						console.log("Trying to send Disconnection email");
						globalConfigStatus.sendingDisconnectionEmail = true;
						await SendNotificationEmailForDisconnection(globalConfig.emails, globalConfig.disconnectionTimeout, globalConfig.interval2);
						globalConfigStatus.sendingDisconnectionEmail = false;
						globalConfigStatus.disconnectionEmailSent = true;
						console.log("Disconnection email sent");
						return;
					}
					if (globalConfigStatus.sendingReconnectionEmail) {
						return; // Timer is sending ReconnectionEmail
					}
					if (globalConfigStatus.isConnected === false) {
						return;
					}
					console.log("Trying to send Reconnection email");
					globalConfigStatus.sendingReconnectionEmail = true;
					await SendNotificationEmailForReconnection(globalConfig.emails);
					globalConfigStatus.sendingReconnectionEmail = false;
					globalConfigStatus.disconnectionEmailSent = false;
					clearInterval(globalConfigStatus.timeoutForDisconnection);
					globalConfigStatus.timeoutForDisconnection = null;
					console.log("Reconnection email sent and Timer interruped");
				} catch (err) {
					if (globalConfigStatus.sendingDisconnectionEmail) {
						globalConfigStatus.sendingDisconnectionEmail = false;
						return;
					}
					if (globalConfigStatus.sendingReconnectionEmail) {
						globalConfigStatus.sendingReconnectionEmail = false;
						return;
					}
					console.log("Email error");
					console.log(err);
					console.log(globalConfigStatus);
				}
			},
			globalConfig.disconnectionTimeout);
		break;
	}
	case thingshub.RealtimeConnectionStates.Connected: {
		console.log("Connected");
		globalConfigStatus.isConnected = true;
		if (globalConfigStatus.timeoutForDisconnection === null) {
			return; // Timer was not started. First connection is a case
		}
		if (globalConfigStatus.sendingDisconnectionEmail) {
			return; // Timer try to send Disconnection Email
		}
		if (globalConfigStatus.sendingReconnectionEmail) {
			return; // Timer try to send Reconnection Email
		}
		if (globalConfigStatus.disconnectionEmailSent) {
			return; // Timer has sent Disconnection Email but not Reconnection Email
		}
		clearInterval(globalConfigStatus.timeoutForDisconnection);
		globalConfigStatus.timeoutForDisconnection = null;
		console.log("Timeout canceled");
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

const onAPI = async (data) => {
	// console.log(data);
};
const onUpdateThing = async (thingDTO) => {
	// console.log(thingDTO);
};
const  onUpdateThingValue = async (thingId, value, asCmd) => {
	if (ThingsConfigs.has(thingId) === false)
		return;
	const thingStatus = ThingsConfigs.get(thingId).status;
	thingStatus.lastOnUpdateThingValueEvent = Date.now();
	thingStatus.lastValue = value;
};

const realTimeConnector = new thingshub.SocketIORealtimeConnector(endPoint.server,
	accountManager.getSecurityToken,
	onError, onConnectError, onStateChanged);
realTimeConnector.subscribe();
realTimeConnector.setHook("api", onAPI);
realTimeConnector.setHook("onUpdateThing", onUpdateThing);
realTimeConnector.setHook("onUpdateThingValue", onUpdateThingValue);

// Test realtime connection
realTimeConnector.api()
	.then(function (data) {
		console.log(data);
	})
	.catch(function (err) {
		console.log(err);
	});

// 
const mainThingForConfig = new thingshub.Thing();
const thingsManagerClaims = {

	publicReadClaims: thingshub.ThingUserReadClaims.NoClaims,
	publicChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

	everyoneReadClaims: thingshub.ThingUserReadClaims.NoClaims,
	everyoneChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

	creatorUserReadClaims: thingshub.ThingUserReadClaims.AllClaims,
	creatorUserChangeClaims: thingshub.ThingUserChangeClaims.AllClaims
};
const thingsDatacontext = new thingshub.ThingsDataContext(endPoint, accountManager.getSecurityHeader);
const thingsManager = new thingshub.ThingsManager(mainThingForConfig, process.env.CONFIG_THING_KIND, thingsManagerClaims, thingsDatacontext, realTimeConnector);
let httpRequestCanceler = new thingshub.HttpRequestCanceler();

thingsManager.getMoreThings(httpRequestCanceler)
	.then(function (data) {
		console.log(mainThingForConfig);
	})
	.catch(function (err) {
		// Used default Config Thing
		console.log(err);
	});

//
readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true); // ToDo: Why in debug does not works?
process.stdin.on("keypress", (str, key) => {
	if (key.ctrl && key.name === "c") {
		console.log("bye");
		process.exit();
	} else {
		console.log(`You pressed the "${str}" key`);
		console.log();
		console.log(key);
		console.log();
	}
});
console.log("Press any key...");
