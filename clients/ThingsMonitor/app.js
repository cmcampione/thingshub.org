const readline = require("readline");
const path = require("path");
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const dotenv = require("dotenv");
const thingshub = require("thingshub-js-sdk");
const logger = require("./logger");

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
	logger.error("Main ApiKey not found in .env file", { code: 11 });
	process.exit();
}
const endPoint = {
	server: process.env.ENDPOINT_SERVER,
	api: process.env.ENDPOINT_API
};
if (!endPoint.server || !endPoint.api) {
	logger.error("EndPoint data not found in .env file", { code: 12 });
	process.exit();
}
const configThingKind = process.env.CONFIG_THING_KIND;
if (!configThingKind) {
	logger.error("Config Thing Kind not found in .env file", { code: 13 });
	process.exit();
}

const defaultAlertEmail = process.env.DEFAULT_ALERT_EMAIL;

//
/*
const ThingsConfigs = new Map([
	["f4c3c80b-d561-4a7b-80a5-f4805fdab9bb", {// My home
		config: {
			configThingId: "fb9071b5-133a-4716-86c6-4e14d798a2d1", // My Home - Config
			thingKind: "Home appliance", // Home appliance
			onUpdateThingValueInterval: 20 * 1000, // 10 seconds - Bees pull every 5 seconds		
			emails: [defaultAlertEmail],
			thingName: "My Home",
			checkInterval: null,
			// Specific for Home appliance
			sensors: new Map([
				["31669624", {
					sensorName: "Salone",
					onUpdateThingValueAlarmValue: 1
				}],
				["7271203", {
					sensorName: "Contatto filare",
					onUpdateThingValueAlarmValue: 1
				}],
				["8171288", {
					sensorName: "Telecomando 1 chiudi",
					onUpdateThingValueAlarmValue: 1
				}],
				["8171284", {
					sensorName: "Telecomando 1 apri",
					onUpdateThingValueAlarmValue: 1
				}],
				["7830832", {
					sensorName: "Sensore fumi",
					onUpdateThingValueAlarmValue: 1
				}]
			])
		},
		status: {
			lastOnUpdateThingValueEvent: null,
			inAlarmForDelay: false,
			sensors: new Map([
				["31669624", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["7271203", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["8171288", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["8171284", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["7830832", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}]
			])
		}
	}],
	["3601b4c5-706d-4917-ac21-3c2ef1f01fd0", {// My car
		config: {
			configThingId: "",
			thingKind: "c3aa4d95-4cb4-415c-a251-7fe846e0fd17", // GPS
			onUpdateThingValueInterval: 30 * 1000, // 20 seconds - GPS pull every 15 seconds		
			emails: [defaultAlertEmail],
			thingName: "My Car",
			checkInterval: null,
			// Specific for GPS
		},
		status: {
			lastOnUpdateThingValueEvent: null,
			inAlarmForDelay: false,
			inAlarmForAlarm: false,
			emailAlarmSending: false,
			emailAlarmSent: false
		}		
	}]
]);
*/
const ThingsConfigs = new Map([
	["f4c3c80b-d561-4a7b-80a5-f4805fdab9bb", {// My home
		config: {
			configThingId: "fb9071b5-133a-4716-86c6-4e14d798a2d1", // My Home - Config
			thingKind: "Home appliance", // Home appliance
			onUpdateThingValueInterval: 20 * 1000, // 10 seconds - Bees pull every 5 seconds		
			emails: [defaultAlertEmail],
			thingName: "My Home",
			checkInterval: null,
			// Specific for Home appliance
			sensors: new Map([
				["MAT-ALSTATE", {
					sensorName: "In allarme",
					onUpdateThingValueAlarmValue: 1
				}],
				["MAT-AURSTATE", {
					sensorName: "Antifurto Armato da remoto",
					onUpdateThingValueAlarmValue: 1
				}],
				["MAT-AUSTATE", {
					sensorName: "Antifurto Armato",
					onUpdateThingValueAlarmValue: 1
				}],
				["MAT-DASTATE", {
					sensorName: "Porta d'ingresso aperta",
					onUpdateThingValueAlarmValue: 1
				}],
				["MAT-IASTATE", {
					sensorName: "Porte balconi aperte",
					onUpdateThingValueAlarmValue: 1
				}],
				["MAT-AASTATE", {
					sensorName: "Antitamper aperto",
					onUpdateThingValueAlarmValue: 1
				}]
			])
		},
		status: {
			lastOnUpdateThingValueEvent: null,
			inAlarmForDelay: false,
			sensors: new Map([
				["MAT-ALSTATE", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["MAT-AURSTATE", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["MAT-AUSTATE", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["MAT-DASTATE", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["MAT-IASTATE", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}],
				["MAT-AASTATE", {
					inAlarmForAlarm: false,
					emailAlarmSending: false,
					emailAlarmSent: false
				}]
			])
		}
	}],
	["3601b4c5-706d-4917-ac21-3c2ef1f01fd0", {// My car
		config: {
			configThingId: "",
			thingKind: "c3aa4d95-4cb4-415c-a251-7fe846e0fd17", // GPS
			onUpdateThingValueInterval: 30 * 1000, // 20 seconds - GPS pull every 15 seconds		
			emails: [defaultAlertEmail],
			thingName: "My Car",
			checkInterval: null,
			// Specific for GPS
		},
		status: {
			lastOnUpdateThingValueEvent: null,
			inAlarmForDelay: false,
			inAlarmForAlarm: false,
			emailAlarmSending: false,
			emailAlarmSent: false
		}		
	}]
]);
//
async function SendAlarmEmailForDelay(emails, thingName, delay, culture) {

	logger.info(`SendAlarmEmailForDelay: ${thingName}`, { code: 1 });

	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}
	subject += ": " + thingName;

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

	logger.info(`SendReenteredEmailForDelay: ${thingName}`, { code: 2 });

	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}
	subject += ": " + thingName;

	// Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/reenteredEmailForDelay-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			supportemail: process.env.SUPPORT_EMAIL,
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
	try {
		if (ThingsConfigs.has(thingId) === false)
			return;
		const thingConfig = ThingsConfigs.get(thingId).config;
		const thingStatus = ThingsConfigs.get(thingId).status;

		// Check alarm for delay
		if (thingStatus.lastOnUpdateThingValueEvent === null || Date.now() - thingStatus.lastOnUpdateThingValueEvent > thingConfig.onUpdateThingValueInterval) {
			if (thingStatus.inAlarmForDelay === false) {
				thingStatus.inAlarmForDelay = true;
				await SendAlarmEmailForDelay(thingConfig.emails, thingConfig.thingName, thingConfig.onUpdateThingValueInterval);
			}		
			return;
		}
		if (thingStatus.inAlarmForDelay === true) {
			thingStatus.inAlarmForDelay = false;
			await SendReenteredEmailForDelay(thingConfig.emails, thingConfig.thingName);
		}
	} catch(err) {
		logger.error(err, { code: 7 });
	}
}

ThingsConfigs.forEach((value, key, map) => {
	let delay = value.config.onUpdateThingValueInterval;
	value.config.checkInterval = setInterval(async function () {
		await checkAlarmForDelay(key);
	}, delay);
});

//
const accountDataContext = new thingshub.AccountDataContext(endPoint);
const accountManager = new thingshub.AccountManager("thingshub", accountDataContext, mainApiKey);

function onError(error) {
	logger.error(error, { code: 16});
}
function onConnectError(error) {
	logger.error(error, { code: 17});
}

//
const globalConfig = {
	disconnectionTimeout: 10000, // 10 seconds
	emails: [defaultAlertEmail]
};
const globalConfigStatus = {
	isConnected: false,
	timeoutForDisconnection: null,
	sendingDisconnectionEmail: false,
	sendingReconnectionEmail: false,
	disconnectionEmailSent: false
};

//
async function SendNotificationEmailForDisconnection(emails, interval1, culture) {

	logger.info("SendNotificationEmailForDisconnection", { code: 3 });

	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}
	subject += ": Disconnection";

	// Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/disconnectionEmail-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			supportemail: process.env.SUPPORT_EMAIL,
			interval1: Math.round(interval1 / 1000),
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

	logger.info("SendNotificationEmailForReconnection", { code: 4 });

	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}
	subject += ": Reconnection";

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
				try {
					if (globalConfigStatus.sendingDisconnectionEmail) {
						return; // Timer is sending DisconnectionEmail
					}
					if (globalConfigStatus.disconnectionEmailSent === false) {
						globalConfigStatus.sendingDisconnectionEmail = true;
						await SendNotificationEmailForDisconnection(globalConfig.emails, globalConfig.disconnectionTimeout);
						globalConfigStatus.sendingDisconnectionEmail = false;
						globalConfigStatus.disconnectionEmailSent = true;
						return;
					}
					if (globalConfigStatus.sendingReconnectionEmail) {
						return; // Timer is sending ReconnectionEmail
					}
					if (globalConfigStatus.isConnected === false) {
						return;
					}
					globalConfigStatus.sendingReconnectionEmail = true;
					await SendNotificationEmailForReconnection(globalConfig.emails);
					globalConfigStatus.sendingReconnectionEmail = false;
					globalConfigStatus.disconnectionEmailSent = false;
					clearInterval(globalConfigStatus.timeoutForDisconnection);
					globalConfigStatus.timeoutForDisconnection = null;
				} catch (err) {
					if (globalConfigStatus.sendingDisconnectionEmail) {
						globalConfigStatus.sendingDisconnectionEmail = false;
						return;
					}
					if (globalConfigStatus.sendingReconnectionEmail) {
						globalConfigStatus.sendingReconnectionEmail = false;
						return;
					}
					logger.error(err, {code: 17});
					console.log(`globalConfigStatus : ${globalConfigStatus}`, {code: 18 });
				}
			},
			globalConfig.disconnectionTimeout);
		break;
	}
	case thingshub.RealtimeConnectionStates.Connected: {
		globalConfigStatus.isConnected = true;
		if (globalConfigStatus.timeoutForDisconnection === null) {
			return; // Timer was not started. First connection is a case
		}
		if (globalConfigStatus.sendingDisconnectionEmail) {
			return; // Timer tries to send Disconnection Email
		}
		if (globalConfigStatus.sendingReconnectionEmail) {
			return; // Timer tries to send Reconnection Email
		}
		if (globalConfigStatus.disconnectionEmailSent) {
			return; // Timer has sent Disconnection Email but not Reconnection Email
		}
		clearInterval(globalConfigStatus.timeoutForDisconnection);
		globalConfigStatus.timeoutForDisconnection = null;
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

//
async function SendAlarmEmailForAlarm(emails, sensorName, culture) {
	logger.info(`SendAlarmEmailForAlarm: ${sensorName}`, { code: 5 });

	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}
	subject += ": " + sensorName;

	// Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/alarmEmailForAlarm-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			supportemail: process.env.SUPPORT_EMAIL,
			sensorName: sensorName,
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
async function SendReenteredEmailForAlarm(emails, sensorName, culture) {
	logger.info(`SendReenteredEmailForAlarm: ${sensorName}`, { code: 6 });
	// ToDo: Fix correct culture
	culture = "it-IT";
	let subject = process.env[`NOTIFICATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.NOTIFICATION_EMAIL_SUBJECT_DEFAULT;
	}
	subject += ": " + sensorName;

	// Render html
	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "./views/reenteredEmailForAlarm-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			supportemail: process.env.SUPPORT_EMAIL,
			sensorName: sensorName,
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
const onUpdateThingValue = async (thingId, value, asCmd) => {
	if (asCmd)
		return;
	if (ThingsConfigs.has(thingId) === false)
		return;
	const thingConfig = ThingsConfigs.get(thingId).config;
	if (!thingConfig)
		return;
	const thingStatus = ThingsConfigs.get(thingId).status;
	if (!thingStatus)
		return;

	switch (thingConfig.thingKind) {
	case process.env.CONFIG_THING_KIND:
		return;
	case process.env.HOME_THING_KIND: {
		break;
	}
	case process.env.GPS_THING_KIND: {
		break;
	}
	}
		
	thingStatus.lastOnUpdateThingValueEvent = Date.now();
	switch (thingConfig.thingKind) {
	case process.env.CONFIG_THING_KIND:
		return;
	case process.env.HOME_THING_KIND: {
		value.sensors.forEach(async (sensorRaw) => {
			const sensorConfig = thingConfig.sensors.get(sensorRaw.id);
			if (!sensorConfig)
				return;
			const sensorStatus = thingStatus.sensors.get(sensorRaw.id);
			if (!sensorStatus)
				return;
			if (sensorStatus.emailAlarmSending === true)
				return;
			if (sensorRaw.value === sensorConfig.onUpdateThingValueAlarmValue) {
				if (sensorStatus.inAlarmForAlarm === false) {
					sensorStatus.inAlarmForAlarm = true;
					try {
						sensorStatus.emailAlarmSending = true;
						await SendAlarmEmailForAlarm(thingConfig.emails, sensorConfig.sensorName);
						sensorStatus.emailAlarmSending = false;
					} catch(err) {
						logger.error(err, { code: 8 });
					}
				}
				return;
			}
			if (sensorStatus.inAlarmForAlarm === true) {
				sensorStatus.inAlarmForAlarm = false;
				try {
					sensorStatus.emailAlarmSending = true;
					await SendReenteredEmailForAlarm(thingConfig.emails, sensorConfig.sensorName);
					sensorStatus.emailAlarmSending = false;
				} catch(err) {
					logger.error(err, { code: 9 });
				}
			}
		});
		break;
	}
	case process.env.GPS_THING_KIND: {
		break;
	}
	}
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
		logger.error(err, { code: 14 });
	});

// 
const thingsDatacontext = new thingshub.ThingsDataContext(endPoint, accountManager.getSecurityHeader);
//
const thingsManagerClaims = {

	publicReadClaims: thingshub.ThingUserReadClaims.NoClaims,
	publicChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

	everyoneReadClaims: thingshub.ThingUserReadClaims.NoClaims,
	everyoneChangeClaims: thingshub.ThingUserChangeClaims.NoClaims,

	creatorUserReadClaims: thingshub.ThingUserReadClaims.AllClaims,
	creatorUserChangeClaims: thingshub.ThingUserChangeClaims.AllClaims
};
let httpRequestCanceler = new thingshub.HttpRequestCanceler();
// Config Things
const mainThingForConfig = new thingshub.Thing();
const thingsMngConfig = new thingshub.ThingsManager(mainThingForConfig, process.env.CONFIG_THING_KIND, thingsManagerClaims, thingsDatacontext, realTimeConnector);
thingsMngConfig.getMoreThings(httpRequestCanceler)
	.then(function (data) {
		console.log(mainThingForConfig);
	})
	.catch(function (err) {
		// Used default Config Thing
		logger.error(err, { code: 15 });
	});
// Home appliance Things
const mainThingForHome = new thingshub.Thing();
const thingsMngForHome = new thingshub.ThingsManager(mainThingForHome, process.env.HOME_THING_KIND, thingsManagerClaims, thingsDatacontext, realTimeConnector);
thingsMngForHome.getMoreThings(httpRequestCanceler)
	.then(function (data) {
		console.log(mainThingForHome);
	})
	.catch(function (err) {
		// Used default Config Thing
		logger.error(err, { code: 16 });
	});
// GPS
const mainThingForGPS = new thingshub.Thing();
const thingsMngForGPS = new thingshub.ThingsManager(mainThingForGPS, process.env.GPS_THING_KIND, thingsManagerClaims, thingsDatacontext, realTimeConnector);
thingsMngForGPS.getMoreThings(httpRequestCanceler)
	.then(function (data) {
		console.log(mainThingForGPS);
	})
	.catch(function (err) {
		// Used default Config Thing
		logger.error(err, {code: 10 });
	});

//
readline.emitKeypressEvents(process.stdin);
// process.stdin.setRawMode(true); // ToDo: Why in debug does not works?
process.stdin.on("keypress", (str, key) => {
	if (key.ctrl && key.name === "c") {
		console.log("bye");
		// ToDo: cleaning resource?
		process.exit();
	} else {
		console.log(`You pressed the "${str}" key`);
		console.log();
		console.log(key);
		console.log();
	}
});
console.log("Press any key...");
