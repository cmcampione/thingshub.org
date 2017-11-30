"use strict";

console.log("-----------------------------------------------------------");

const net         	= require("net");
const path    			= require("path");
const dotenv  		= require("dotenv");
const gpsDataMod     = require("./gpsData.js");
const parser        = require("./parsers.js");
const elaboratorsMod = require("./elaborators.js");

// Env configuration

const configPath = path.join(__dirname, "./", "trackerServer.env");
dotenv.config({ path: configPath });

var GPSs = [];

// INFO: The initial X is to avoid implicit Javascript conversion in int
GPSs["X" + process.env.MAIN_GPS] = new gpsDataMod.Data();

var elaborators = [];

elaborators.push(new elaboratorsMod.ElaboratorUIGPSData());
elaborators.push(new elaboratorsMod.ElaboratorFreeAnts());
elaborators.push(new elaboratorsMod.ElaboratorThingsHub());

var server = net.createServer();  
server.on("connection", handleConnection);

server.listen(process.env.TRACKER_SERVER_PORT, function() {  
	console.log("server listening to %j", server.address());
	console.log("-----------------------------------------------------------");
});

function handleConnection(conn) {

	var remoteAddress = conn.remoteAddress + ":" + conn.remotePort;
	console.log("new client connection from %s", remoteAddress);
	console.log("-----------------------------------------------------------");

	conn.setEncoding("utf8");

	conn.on("data", onConnData);
	conn.once("close", onConnClose);
	conn.on("error", onConnError);

	function onConnData(d) {

		console.log("connection data from %s: %j", remoteAddress, d);
		console.log("-----------------------------------------------------------");

		var currentGPSData = parser.parse(d);

		if (GPSs["X" + currentGPSData.deviceId] == undefined)
			GPSs["X" + currentGPSData.deviceId] = new gpsDataMod.Data();

		var lastGPSData = GPSs["X" + currentGPSData.deviceId];

		lastGPSData.deviceId = currentGPSData.deviceId;
		lastGPSData.lastEventDateTime = new Date();
		lastGPSData.lastStatus = currentGPSData.lastStatus;
		if (currentGPSData.lastStatus.result == gpsDataMod.ResultStatus.Ok) {
			lastGPSData.surveyDateTime = currentGPSData.surveyDateTime;
			lastGPSData.angle = currentGPSData.angle;
			lastGPSData.lat = currentGPSData.lat;
			lastGPSData.lng = currentGPSData.lng;
			lastGPSData.speed = currentGPSData.speed;
		}

		for (var i = 0; i < elaborators.length; i++)
			elaborators[i].elaborate(lastGPSData);
	}

	function onConnClose() {
		console.log("connection from %s closed", remoteAddress);
		console.log("-----------------------------------------------------------");
	}

	function onConnError(err) {
		console.log("Connection %s error: %s", remoteAddress, err.message);
		console.log("-----------------------------------------------------------");
	}
}