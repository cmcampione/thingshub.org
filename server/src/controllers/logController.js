"use strict";

const httpStatusCodes 	= require("http-status-codes");
const passport 			= require("passport");
const express 			= require("express");

const utils 			= require("../utils.js");
const logModel		    = require("../models/Log.js");

const RealtimeNotifier 	= require("../realtimeNotifier");

const router = express.Router();

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

module.exports = router;
