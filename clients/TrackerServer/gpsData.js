"use strict";

export const ResultStatus = {
	Undefined : 0,
	Ok : 1,
	IncompleteLine : 2,
	SyntaxError : 3,
	CommandNotSupported : 4,
	InternalError : 5
};

export function ResultStatusData(res, msg){
	this.result = (res == undefined) ? ResultStatus.Undefined : res;
	this.message = (msg == undefined) ? "" : msg;
}

export function Data() {
	this.lastStatus = new ResultStatusData();
	this.deviceId = "";
	this.lastEventDateTime = new Date();
	this.surveyDateTime = "";
	this.lat = 0.0;
	this.lng = 0.0;
	this.speed = 0.0;
	this.angle = 0.0;
}