"use strict";

console.log("-----------------------------------------------------------");

import { createServer } from "net";
import { join } from "path";
import { config } from "dotenv";
import { Data, ResultStatus } from "./gpsData.js";
import { parse } from "./parsers.js";
import { ElaboratorUIGPSData, ElaboratorThingsHub } from "./elaborators.js";

// Env configuration

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const configPath = join(__dirname, "./", "trackerServer.env");
config({ path: configPath });

var GPSs = [];

// INFO: The initial X is to avoid implicit Javascript conversion in int
GPSs["X" + process.env.MAIN_GPS] = new Data();

var elaborators = [];

elaborators.push(new ElaboratorUIGPSData());
//elaborators.push(new elaboratorsMod.ElaboratorFreeAnts());
elaborators.push(new ElaboratorThingsHub());

var server = createServer();  
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

		var currentGPSData = parse(d);

		var lastGPSData = GPSs["X" + currentGPSData.deviceId];
		if (!lastGPSData)
			lastGPSData = new Data();

		lastGPSData.deviceId = currentGPSData.deviceId;
		lastGPSData.lastEventDateTime = new Date();
		lastGPSData.lastStatus = currentGPSData.lastStatus;
		if (currentGPSData.lastStatus.result == ResultStatus.Ok) {
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