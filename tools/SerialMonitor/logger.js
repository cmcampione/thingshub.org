"use strict";

const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { createLogger, format, transports } = require("winston");

const env = process.env.NODE_ENV || "development";
const logDir = "log";

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const filename = path.join(logDir, "results.log");

const timezoneUTC = () => {
	return moment().utc().format("YYYY-MM-DD HH:mm:ss");
};

const logger = createLogger({
	// change level if in dev environment versus production
	level: env === "production" ? "info" : "debug",
	format: format.combine(
		//format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		format.timestamp({ format: timezoneUTC })
	),
	transports: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				format.printf(
					info => `${info.timestamp}; ${info.level}; ${info.code}; ${info.message}`
				)
			)
		}),
		new transports.File({
			filename,
			format: format.combine(
				format.printf(
					info => `${info.timestamp}; ${info.level}; ${info.code}; ${info.message}`
				)
			)
		})
	]
});

module.exports = logger;
