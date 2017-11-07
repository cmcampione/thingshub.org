"use strict";

const fs      			= require("fs");
const path    			= require("path");
const dotenv  			= require("dotenv");
const https   			= require("https");
const express 			= require("express");
const expressValidator 	= require("express-validator");
var mongoose  			= require("mongoose");

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

const app = express();

// This line must be immediately after any of the bodyParser middlewares!
app.use(expressValidator());

app.get("/api", function (req, res) {
	res.status(200).send("the bees are laborious");
});

const AccountController = require(__dirname + "/controllers/accountController");
app.use("/api/account", AccountController);

// Catch all for error messages.  Instead of a stack
// trace, this will log the json of the error message
// to the browser and pass along the status with it
// You define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
	if (err) {
		if (err.statusCode == null) {
			console.error("Internal unexpected error from:", err.stack);
			res.status(500);
			res.json(err);
		} else {
			res.status(err.statusCode);
			res.json(err.message);
		}
	} else {
		next();
	}
});

// TODO: Change these for your own certificates.  This was generated through the commands:
// openssl genrsa -out privatekey.pem 2048
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
const options = {
	key  : fs.readFileSync(path.join(__dirname, "../certs/privatekey.pem")),
	cert : fs.readFileSync(path.join(__dirname, "../certs/certificate.pem"))
};
const httpsServer = https.createServer(options, app);

var port = process.env.PORT || 3000;
httpsServer.listen(port, (err) => {
	if (err) {
		console.log(err);
		process.exit();
		return;  
	}
	console.log("ThingsHub - Server started on port " + port);
});

