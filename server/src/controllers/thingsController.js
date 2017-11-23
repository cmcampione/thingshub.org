// import { constants } from "zlib";

"use strict";

const httpStatus 		= require("http-status-codes");
const express 			= require("express");
const passport 			= require("passport");

const utils 			= require("../utils.js");
const constants 		= require("../constants");
const thingsMngr		= require("../bl/thingsMngr");
const ClientsConnectorsManager = require("../clientsConnectorsManager");

const router = express.Router();

router.get("/", function(req, res, next) {
	passport.authenticate("localapikey", async function(err, user, info) {
		try {
			if (err) { 
				return next(err); 
			}
			if (!user) { 
				return next(new utils.ErrorCustom(httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 10));
			}

			res.json(await thingsMngr.getThings(user));
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatus.INTERNAL_SERVER_ERROR, e.message, 8));
		}
	})(req, res, next);
});

router.get("/:id", function(req, res, next) {
	passport.authenticate("localapikey", async function(err, user, info) {
		try {
			if (err) { 
				return next(err); 
			}

			let thingId = req.params.id;

			res.json(await thingsMngr.getThing(user, thingId, constants.ThingDeletedStates.NoMatter));

		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatus.INTERNAL_SERVER_ERROR, e.message, 50));
		}
	})(req, res, next);
});

// Create Thing
router.post("/", async function (req, res, next){
	passport.authenticate("localapikey", async function(err, user, info) {
		try {
			if (err) { 
				return next(err); 
			}
			if (!user) { 
				return next(new utils.ErrorCustom(httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 22));
			}

			let thingDTO = req.body;

			let blResult = await thingsMngr.createThing(user, thingDTO);

			ClientsConnectorsManager.onCreateThing(blResult.usersIdsToNotify, blResult.thingDTO);

			res.json(blResult.thingDTO);

		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatus.INTERNAL_SERVER_ERROR, e.message, 23));
		}
	})(req, res, next);
});

module.exports = router;