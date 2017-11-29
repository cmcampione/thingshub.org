"use strict";

var gpsDataMod = require("./gpsData.js");

var GT02AProtocolState = {
	WaitStart : 0,
	WaitStop : 1,
	WaitFinished : 2,
	WaitDeviceId : 3,
	WaitCommand : 4,
	WaitDate : 5,
	WaitDataAvailable : 6,
	WaitLatLng : 7,
	WaitSpeed : 8,
	WaitTime : 9,
	WaitAngle : 10
};

module.exports = {
	parse: function(content) {

		var gpsData = new gpsDataMod.Data();

		var currentFieldPos = 0;
		var currentFieldLenght = 1;

		var state = GT02AProtocolState.WaitStart;

		while(state != GT02AProtocolState.WaitFinished) {
			if (currentFieldPos + currentFieldLenght > content.Length) {
				gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.IncompleteLine, new Date().toUTCString() + " - Incomplete line" + " - Content: " + content ); 
				return gpsData;
			}

			var field = null;

			if (currentFieldLenght != 0)
				field = content.substring(currentFieldPos, currentFieldPos + currentFieldLenght);
      
			switch(state) {
			case GT02AProtocolState.WaitStart:
				if (field != "(") {
					gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.SyntaxError, new Date().toUTCString() + " - Syntax error - pos: " + currentFieldPos + " - Expected '('" + " - field: " + field + " - Content: " + content );
					return gpsData;
				}

				state = GT02AProtocolState.WaitDeviceId;
				currentFieldPos += 1;
				currentFieldLenght = 12;
				break;
			case GT02AProtocolState.WaitDeviceId:
				if (!field) {
					gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.SyntaxError, new Date().toUTCString() + " - Syntax error - pos: " + currentFieldPos + " - Device Id can't be empty" + " - Content: " + content);
					return gpsData;
				}

				gpsData.deviceId = field;

				state = GT02AProtocolState.WaitCommand;
				currentFieldPos += 12;
				currentFieldLenght = 4;
				break;
			case GT02AProtocolState.WaitCommand:
				switch(field) {
				case "BR00":
					state = GT02AProtocolState.WaitDate;
					currentFieldPos += 4;
					currentFieldLenght = 6;
					break;
				case "BP00":
					state = GT02AProtocolState.WaitFinished;
					gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.CommandNotSupported, new Date().toUTCString() + " - Command not supported - pos: " + currentFieldPos + " - Command: " + field + " - Content: " + content);
					return gpsData;
				case "BZ00":
					state = GT02AProtocolState.WaitFinished;
					gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.CommandNotSupported, new Date().toUTCString() + " - Command not supported - pos: " + currentFieldPos + " - Command: " + field + " - Content: " + content);
					return gpsData;
				default:
					state = GT02AProtocolState.WaitFinished;
					gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.CommandNotSupported, new Date().toUTCString() + " - Command not supported - pos: " + currentFieldPos + " - Command: " + field + " - Content: " + content);
					return gpsData;
				}
				break;
			case GT02AProtocolState.WaitDate:
				var year = 2000 + parseInt(field.substring(0, 2));
				var month = parseInt(field.substring(2, 4)) - 1;
				var day = parseInt(field.substring(4, 6));

				gpsData.surveyDateTime = new Date(year, month, day, 0, 0, 0);

				state = GT02AProtocolState.WaitDataAvailable;
				currentFieldPos += 6;
				currentFieldLenght = 1;
				break;
			case GT02AProtocolState.WaitDataAvailable:
				if (field != "A") {
					//TODO: Non so attualmente cosa succede quando i dati non sono validi. Per ora non faccio niente
					state = GT02AProtocolState.WaitFinished;
					gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.CommandNotSupported, new Date().toUTCString() + " - GPS data not available - pos: " + currentFieldPos + " - Command: " + field + " - Content: " + content);

					return gpsData;
				}

				state = GT02AProtocolState.WaitLatLng;
				currentFieldPos += 1;
				currentFieldLenght = 21;
				break;
			case GT02AProtocolState.WaitLatLng:
				var latDegrees = parseFloat(field.substring(0, 2));
				var latMinutes = parseFloat(field.substring(2, 9));

				gpsData.lat = latDegrees + latMinutes / 60.00;

				var northSouth = field.substring(9, 10);//TODO: E' importante memorizzare in gpsData

				var lngDegrees = parseFloat(field.substring(10, 13));
				var lngMinutes = parseFloat(field.substring(13, 20));

				gpsData.lng = lngDegrees + lngMinutes / 60.00;

				var eastWest = field.substring(20, 21);//TODO: E' importante memorizzare in gpsData

				state = GT02AProtocolState.WaitSpeed;
				currentFieldPos += 21;
				currentFieldLenght = 5;
				break;
			case GT02AProtocolState.WaitSpeed:
				gpsData.speed = parseFloat(field.substring(0, 5));

				state = GT02AProtocolState.WaitTime;
				currentFieldPos += 5;
				currentFieldLenght = 6;
				break;
			case GT02AProtocolState.WaitTime:
				var hours   = parseInt(field.substring(0, 2));
				var minutes = parseInt(field.substring(2, 4));
				var seconds = parseInt(field.substring(4, 6));

				console.log("hour: " + hours + " minutes: " + minutes + " seconds: " + seconds);

				gpsData.surveyDateTime = new Date(Date.UTC(gpsData.surveyDateTime.getFullYear(), gpsData.surveyDateTime.getMonth(), gpsData.surveyDateTime.getDate(), hours, minutes, seconds));

				console.log("surveyDateTime: " + gpsData.surveyDateTime);

				state = GT02AProtocolState.WaitAngle;
				currentFieldPos += 6;
				currentFieldLenght = 6;
				break;
			case GT02AProtocolState.WaitAngle:
				gpsData.angle = parseFloat(field.substring(0, 6));

				state = GT02AProtocolState.WaitFinished;//TODO: I dati sono per ora sufficienti, ma bisognerebbe continuare con il resto del parsing
				break;
			case GT02AProtocolState.WaitStop:
				if (field != ")") {
					gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.SyntaxError, new Date().toUTCString() + " - Syntax error - pos: " + currentFieldPos + " Expected '('" + " - field: " + field + " - Content: " + content);
					return gpsData;
				}

				state = GT02AProtocolState.WaitFinished;
				break;
			default:
				gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.InternalError, new Date().toUTCString() + " - Internal error - pos: " + currentFieldPos + " - field: " + field + " - Content: " + content);
				return gpsData;
			}
		}

		gpsData.lastStatus = new gpsDataMod.ResultStatusData(gpsDataMod.ResultStatus.Ok, new Date().toUTCString() + " - All is Ok" );
		return gpsData;
	}
};

