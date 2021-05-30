"use strict";

import moment from "moment";
import fs from "fs";
import path from "path";
import winston from "winston";
const { createLogger, format, transports } = winston;

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

export const logger = createLogger({
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
		})/* ,
    new transports.File({
		filename,
		format: format.combine(
        format.printf(
			info =>
            `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
        )
    )
    }) */
	]
});

