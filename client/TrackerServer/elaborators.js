"use strict";

var http = require("http");
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
	var GPSs = {"X087073117560" : "5e8f5ed0-a15b-45e6-af59-a6ced478e202"};

	var serverAddress = "titaggocoreportal.azurewebsites.net";
	var apiAddress = "/api";
	var dwApiKey = "";

	this.elaborate = function elaborate(gpsData) {

		var thingId = GPSs["X" + gpsData.deviceId];
		if (!thingId)
		//TODO: Segnalare qualcosa
			return;

		var jsonObject = JSON.stringify(gpsData);

		var optionsPutThingValue = {
			host : serverAddress, 
			port : 80,
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