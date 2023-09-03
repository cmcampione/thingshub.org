"use strict";

import mongoose from "mongoose";
const logSchema = mongoose.Schema({
	timestamp: Date,
	level: String,
	code: Number,
	message: String
});

export const Log = mongoose.model("Log", logSchema);

export const save = log => log.save(log);
