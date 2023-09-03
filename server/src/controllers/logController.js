"use strict";

import httpStatusCodes from "http-status-codes";
import passport from "passport";
import express from "express";

import * as utils from "../utils.js";
import * as logModel from "../models/Log.js";

import { RealtimeNotifier } from "../realtimeNotifier.js";

export const router = express.Router();

router.post("/", async function (req, res, next){
	passport.authenticate(["localapikey", "bearer"], { session: false }, async function(err, user, info) {
		try {
			if (err) { 
				return next(err); 
			}
			if (!user) { 
				return next(new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 125));
			}

			let logDTO = req.body;
			if (!logDTO)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 126);

			let log = new logModel.Log();
            
			log = Object.assign(log, logDTO);

			logModel.save(log);

			RealtimeNotifier.onLog(user._id, logDTO);
            
			res.json(log.id);
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 127));
		}
	})(req, res, next);
});

