"use strict";

const fs      			= require("fs");
const path    			= require("path");
const dotenv  			= require("dotenv");
const httpStatusCodes 	= require("http-status-codes");
const https   			= require("https");
const express 			= require("express");
// const session 			= require("express-session");
// const MongoStore 		= require("connect-mongo")(session);
const bodyParser 		= require("body-parser");
const passport 			= require("passport");
const LocalStrategy 	= require("passport-local").Strategy;
const LocalApiStrategy 	= require("passport-localapikey-update").Strategy;
const BearerStrategy	= require("passport-http-bearer").Strategy;
const BasicStrategy		= require("passport-http").BasicStrategy;
const mongoose  		= require("mongoose");
const cors 				= require("cors");

const logger			= require("./logger");
const utils				= require("./utils");
const usersManager		= require("./bl/usersMngr");
const RealtimeNotifier 	= require("./realtimeNotifier");

// Env configuration

const configPath = path.join(__dirname, "../", "thingsHub.env");
dotenv.config({ path: configPath });

// DB Connection

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, 
	{ 
		//useMongoClient: true,
		auth: {authSource: process.env.MONGODB_AUTHSOURCE},
		user: process.env.MONGODB_USER,
		pass: process.env.MONGODB_PASSWORD
	}).catch(err => {
	logger.error(err,{ code: 124 });
	process.exit();
});

// HTTP server configuration

const app = express();

// Enable cors for all route
var corsOptions = {
	exposedHeaders :"Content-Range"
};
app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Passport setup

passport.use(new LocalStrategy(async function(username, password, done) {
	const user = await usersManager.findUserByUsername(username);
	if (!user) {
		return done(null, false, { message: "Incorrect username" });
	}
	if (!user.comparePassword(password)) {
		return done(null, false, { message: "Incorrect password" });
	}
	return done(null, user);
}));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	usersManager.findUserById(id)
		.then(function(user) {
			done(null, user);
		})
		.catch(function(err) {
			done(err);
		});
});

var localApiStrategyOptions = { 
	apiKeyField: process.env.APIKEY_NAME,
	apiKeyHeader: process.env.APIKEY_NAME
};
passport.use(new LocalApiStrategy(localApiStrategyOptions, function(apikey, done) {
	// asynchronous verification, for effect...
	process.nextTick(async function () {
		
		// Find the user by username.  If there is no user with the given
		// username, or the password is not correct, set the user to `false` to
		// indicate failure and set a flash message.  Otherwise, return the
		// authenticated `user`.
		const user = await usersManager.findUserByMasterApiKey(apikey);
		if (!user) { 
			return done(null, false, { message: "Unknown apikey : " + apikey }); 
		}
		return done(null, user);
	});
}));

passport.use(new BearerStrategy(async function(token, done) {
	try {
		let user = await usersManager.findUserByMasterApiKey(token);
		if (user)
			return done(null, user); 

		const tk = utils.verifyToken(token);

		user = await usersManager.findUserById(tk.sub);
		if (!user)
			return done(null, false, { message: "Unknown token" }); 

		return done(null, user);
	}
	catch(e) {
		return done(null, false, new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 111)); 
	}}));

passport.use(new BasicStrategy( async function(username, password, done) {
	const user = await usersManager.findUserByUsername(username);
	if (!user) {
		return done(null, false, { message: "Incorrect username" });
	}
	if (!user.comparePassword(password)) {
		return done(null, false, { message: "Incorrect password" });
	}
	return done(null, user);
}));

app.use(passport.initialize());
	
// Session support

/* 
app.use(session({ 	
	secret: process.env.SESSION_SECRET,
	store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.session()); 
*/

// Routers

app.get("/api", async function (req, res) {
	
	let msg = "the bees are laborious";

	let users = await usersManager.find({});
	let usersIds = users.map(user => user._id);

	RealtimeNotifier.onAPI(usersIds, msg);

	res.status(200).send(msg);
});

const AccountController = require(__dirname + "/controllers/accountController");
app.use("/api/account", AccountController);

const ThingsController = require(__dirname + "/controllers/thingsController");
app.use("/api/things", ThingsController);

const LogController = require(__dirname + "/controllers/logController");
app.use("/api/log", LogController);

// Errors support

app.use(function(req, res, next) {
	throw new utils.ErrorCustom(httpStatusCodes.NOT_FOUND, httpStatusCodes.getStatusText(httpStatusCodes.NOT_FOUND), 1);
});

// Catch all for error messages.  Instead of a stack
// trace, this will log the json of the error message
// to the browser and pass along the status with it
// You define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
	if (err) {
		let errMsg;
		if (typeof err.message !== "object") {
			res.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
			errMsg = utils.ErrorCustom.formatMessage(9, err);
			res.json(errMsg);
		} else {
			res.status(err.statusCode);
			res.json(err.message);
			errMsg = err.message;
		}
		logger.error(errMsg.message,{ code: errMsg.internalCode });
	} else {
		next();		
	}
});

// HTTPS Server config

// TODO: Change these for your own certificates.  This was generated through the commands:
// openssl genrsa -out privatekey.pem 2048
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
const options = {
	key  : fs.readFileSync(path.join(__dirname, "../certs/privatekey.pem")),
	cert : fs.readFileSync(path.join(__dirname, "../certs/certificate.pem"))
};
const httpsServer = https.createServer(options, app);

const port = process.env.SERVER_PORT || 3000;
httpsServer.listen(port, (err) => {
	if (err) {
		logger.info(err,{ code: 123 });
		process.exit();
	}
	logger.info("Server started on port " + port,{ code: 122 });
});

// Realtime communication support

RealtimeNotifier.initialize(httpsServer);
