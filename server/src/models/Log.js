"use strict";

const mongoose = require("mongoose");
const logSchema = mongoose.Schema({
	timestamp: Date,
	level: String,
	code: Number,
	message: String
});

const Log = mongoose.model("Log", logSchema);

exports.save = log => log.save(log);

exports.Log = Log;