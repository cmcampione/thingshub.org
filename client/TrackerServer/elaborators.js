"use strict";

var http = require("http");
var https = require("https");
var gpsDataMod = require("./gpsData.js");

module.exports.ElaboratorUIGPSData = function() {
	this.elaborate = function elaborate(gpsData) {

		console.log("LastEventDateTime: %s", gpsData.lastEventDateTime.toString());
		console.log("LastStatusMessage: %s", gpsData.lastStatus.message);
        
		if (gpsData.lastStatus.result == gpsDataMod.ResultStatus.Ok)
		{
			console.log("SurveyDateTime: %s", gpsData.surveyDateTime.toString());
			console.log("Device Id: %s", gpsData.deviceId);
			console.log("Lat: %d Lng: %d", gpsData.lat, gpsData.lng);
			console.log("Speed: %d", gpsData.speed);
			console.log("Angle: %d", gpsData.angle);
		}

		console.log("-----------------------------------------------------------");
	};
};

module.exports.ElaboratorFreeAnts = function() {

	//INFO: La X iniziale è per evitare la conversione implicita di javascript in int
	let gpsId = "X" + process.env.MAIN_GPS;
	var GPSs = {gpsId : process.env.FREEANTS_THING};

	var serverAddress = process.env.FREEANTS_SERVERNAME;
	var apiAddress = process.env.FREEANTS_API_URL;
	var dwApiKey = process.env.FREEANTS_DWAPIKEY;

	this.elaborate = function elaborate(gpsData) {

		var thingId = GPSs["X" + gpsData.deviceId];
		if (!thingId)
		//TODO: Segnalare qualcosa
			return;

		var jsonObject = JSON.stringify(gpsData);

		var optionsPutThingValue = {
			host : serverAddress, 
			port : process.env.FREEANTS_PORT,
			path : apiAddress + "/things/" + thingId + "/value", // the rest of the url with parameters if needed
			method : "PUT", 
			headers : {
				"Content-Type"   : "application/json",
				"Content-Length" : Buffer.byteLength(jsonObject, "utf8"),
				"DWApiKey"       : dwApiKey 
			}
		};

		var responseData = "";
		var reqPut = http.request(optionsPutThingValue, function(res) {
			res.on("data", function(d) {
				responseData += d;
			});
			res.on("end", function() {
			});
		});

		reqPut.on("error", function(e) {
			console.error(e);
			console.log("-----------------------------------------------------------");
		});

		// write the json data
		reqPut.write(jsonObject);
		reqPut.end();
	};
};

module.exports.ElaboratorThingsHub = function() {
	
	//INFO: La X iniziale è per evitare la conversione implicita di javascript in int
	let gpsId = "X" + process.env.MAIN_GPS;
	var GPSs = {gpsId : process.env.THINGSHUB_THING};

	var serverAddress = process.env.THINGSHUB_SERVERNAME;
	var apiAddress = process.env.THINGSHUB_API_URL;
	var thApiKey = process.env.THINGSHUB_THAPIKEY;
	
	this.elaborate = function elaborate(gpsData) {
	
		var thingId = GPSs["X" + gpsData.deviceId];
		if (!thingId)
			//TODO: Segnalare qualcosa
			return;
	
		var jsonObject = JSON.stringify(gpsData);
	
		var optionsPutThingValue = {
			host : serverAddress, 
			port : process.env.THINGSHUB_PORT,
			path : apiAddress + "/things/" + thingId + "/value", // the rest of the url with parameters if needed
			method : "PUT", 
			headers : {
				"Content-Type"   : "application/json",
				"Content-Length" : Buffer.byteLength(jsonObject, "utf8"),
				"thapikey"       : thApiKey 
			}
		};
	
		let responseData = "";
		let reqPut = https.request(optionsPutThingValue, function(res) {
			res.on("data", function(d) {
				responseData += d;
			});
			res.on("end", function() {
			});
		});
	
		reqPut.on("error", function(e) {
			console.error(e);
			console.log("-----------------------------------------------------------");
		});
	
		// write the json data
		reqPut.write(jsonObject);
		reqPut.end();
	};
};