"use strict";

module.exports.ResultStatus = {
	Undefined : 0,
	Ok : 1,
	IncompleteLine : 2,
	SyntaxError : 3,
	CommandNotSupported : 4,
	InternalError : 5
};

module.exports.ResultStatusData = function ResultStatusData(res, msg){
	this.result = (res == undefined) ? module.exports.ResultStatus.Undefined : res;
	this.message = (msg == undefined) ? "" : msg;
};

module.exports.Data = function() {
	this.lastStatus = new module.exports.ResultStatusData();
	this.deviceId = "";
	this.lastEventDateTime = new Date();
	this.surveyDateTime = "";
	this.lat = 0.0;
	this.lng = 0.0;
	this.speed = 0.0;
	this.angle = 0.0;
};