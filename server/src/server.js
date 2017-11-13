"use strict";

const fs      			= require("fs");
const path    			= require("path");
const dotenv  			= require("dotenv");
const httpStatus 		= require("http-status-codes");
const https   			= require("https");
const express 			= require("express");
const expressValidator 	= require("express-validator");
const bodyParser 		= require("body-parser");
const passport 			= require("passport");
const LocalApiStrategy 	= require("passport-localapikey-update").Strategy;
const mongoose  		= require("mongoose");

const utils				= require("./utils");
const usersManager		= require("./bl/usersMngr");

// Env configuration

const configPath = path.join(__dirname, "../", "thingsHub.env");
dotenv.config({ path: configPath });

// DB Connection

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGODB_URI, 
	{ 
		useMongoClient: true,
		auth: {authSource: process.env.MONGODB_AUTHSOURCE},
		user: process.env.MONGODB_USER,
		pass: process.env.MONGODB_PASSWORD
	}).catch(err => {
	console.log(err);
	process.exit();
});

// HTTP server configuration

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// This line must be immediately after any of the bodyParser middlewares!
app.use(expressValidator());

// Passport setup

var localApiStrategyOptions = { 
	apiKeyField: process.env.APIKEY_NAME,
	apiKeyHeader: process.env.APIKEY_NAME
};

passport.use(new LocalApiStrategy(localApiStrategyOptions,
	function(apikey, done) {
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
	}
));
app.use(passport.initialize());

// Routers

app.get("/api", function (req, res) {
	res.status(200).send("the bees are laborious");
});

const AccountController = require(__dirname + "/controllers/accountController");
app.use("/api/account", AccountController);

const ThingsController = require(__dirname + "/controllers/thingsController");
app.use("/api/things", ThingsController);

// Errors support

app.use(function(req, res, next) {
	throw new utils.ErrorCustom(httpStatus.NOT_FOUND, httpStatus.getStatusText(httpStatus.NOT_FOUND), 1);
});
  
// Catch all for error messages.  Instead of a stack
// trace, this will log the json of the error message
// to the browser and pass along the status with it
// You define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
	if (err) {
		if (err.statusCode == null) {
			res.status(httpStatus.INTERNAL_SERVER_ERROR);
			res.json(utils.ErrorCustom.formatMessage(9, err));
		} else {
			res.status(err.statusCode);
			res.json(err.message);
		}
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

const port = process.env.PORT || 3000;
httpsServer.listen(port, (err) => {
	if (err) {
		console.log(err);
		process.exit();
		return;  
	}
	console.log("ThingsHub - Server started on port " + port);
});

// Realtime communication support

// SignalR, Socket.io, Internal, ...
class IClientsConnector {
	// Typically have a list of specific connections
}

// Socket.io support
class ClientsConnectorSocketIO extends IClientsConnector {
	constructor(server) {
		super();

		let self = this;
		
		this.connections = new Map();

		this.io = require("socket.io")(server);

		this.io.use(async (socket, next) => {
			let token = socket.handshake.query.token;
			if (!token)
				return next(new utils.ErrorCustom(httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 11));

			let user = await usersManager.findUserByMasterApiKey(token);
			if (!user)
				return next(new utils.ErrorCustom(httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 12));

			let userId = user._id.toString();
			let userConnections = self.connections.get(userId);
			if (!userConnections) {
				self.connections.set(userId, new Array());
				userConnections = self.connections.get(userId);
			}
			userConnections.push(socket);

			return next();
		});
		
		this.io.on("connection", function (socket) {

			socket.on("disconnect", (reason) => {
				self.connections.forEach((userConnections, userId, mapObj) => {
					
				});	
				// ...
			});
			
			socket.emit("news", { hello: "world" });
			socket.on("my other event", function (data) {
				console.log(data);
			});
		});
	}
}

class ClientsConnectionsManager {
	static init(server) {
		ClientsConnectionsManager.ClientsConnectors = []; // List of ClientsConnectors

		ClientsConnectionsManager.ClientsConnectors.push(new ClientsConnectorSocketIO(server));
	}
}
ClientsConnectionsManager.init(httpsServer);

