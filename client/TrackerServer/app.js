"use strict";

console.log("-----------------------------------------------------------");

var net         = require("net");

var gpsDataMod     = require("./gpsData.js");
var parser         = require("./parsers.js");
var elaboratorsMod = require("./elaborators.js");

var GPSs = [];

//INFO: La X iniziale è per evitare la conversione implicita di javascript in int
GPSs["X087073117560"] = new gpsDataMod.Data();

var elaborators = [];

elaborators.push(new elaboratorsMod.ElaboratorUIGPSData());
elaborators.push(new elaboratorsMod.ElaboratorFreeAnts());

var server = net.createServer();  
server.on("connection", handleConnection);

server.listen(5014, function() {  
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