"use strict";

import httpStatusCodes from "http-status-codes";
import express from "express";
import passport from "passport";

import * as utils from "../utils.js";
import  { logger } from "../logger.js";
import * as thConstants from "../../../common/src/thConstants.mjs";
import * as thingsMngr from "../bl/thingsMngr.js";
import { RealtimeNotifier } from "../realtimeNotifier.js";

export const router = express.Router();

router.get("/:id", function(req, res, next) {
	passport.authenticate(["localapikey", "bearer"], { session: false }, async function(err, user, info) {
		try {
			if (err)
				throw err;

			let thingId = req.params.id;
			if (!thingId)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 93);

			let blResult = await thingsMngr.getThing(user, thingId, thConstants.ThingDeletedStates.NoMatter);
			if (!blResult)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 99);

			res.json(blResult);
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 50));
			return;
		}
	})(req, res, next);
});

router.get("/", function(req, res, next) {
	passport.authenticate(["localapikey", "bearer"], { session: false }, async function(err, user, info) {
		try {
			if (err) { 
				throw err;
			}
			if (!user) { 
				throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 10);
			}

			let parentThingId = req.query.parentThingId;
			let thingFilter = req.query.thingFilter ? JSON.parse(req.query.thingFilter) : null;
			let valueFilter = req.query.valueFilter ? JSON.parse(req.query.valueFilter) : null;
			let orderBy = req.query.orderBy ? JSON.parse(req.query.orderBy) : null;
			let skip = req.query.skip ? parseInt(req.query.skip) : 0;
			let top = req.query.top ? parseInt(req.query.top) : parseInt(process.env.GET_THINGS_MAX_PAGESIZE);

			let paging = utils.validateAndFixInputPaging(skip, top);

			let blResult = await thingsMngr.getThings(user, parentThingId, thingFilter, valueFilter, orderBy, paging.skip, paging.top);
			if (!blResult || !blResult.top == null || !blResult.skip == null || !blResult.totalItems == null)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 98);

			res.setHeader("Content-Range", "Items " + blResult.top + "-" + skip + "/" + blResult.totalItems);

			res.json(blResult.thingsDTO);			
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 8));
			return;
		}
	})(req, res, next);
});

// Create Thing
router.post("/", async function (req, res, next){
	passport.authenticate(["localapikey", "bearer"], { session: false }, async function(err, user, info) {
		try {
			if (err)
				throw err;
			if (!user)
				throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 22);

			let thingDTO = req.body;
			if (!thingDTO)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 92);

			let blResult = await thingsMngr.createThing(user, thingDTO);
			if (!blResult || !blResult.usersIdsToNotify || !blResult.thingDTO)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 100);

			RealtimeNotifier.onCreateThing(blResult.usersIdsToNotify, blResult.thingDTO);

			res.json(blResult.thingDTO);
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 23));
			return;
		}
	})(req, res, next);
});

// Update Thing
router.put("/:id", async function (req, res, next){
	passport.authenticate(["localapikey", "bearer"], { session: false }, async function(err, user, info) {
		try {
			if (err)
				throw err;

			if (!user)
				throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 88);

			let thingId = req.params.id;
			if (!thingId)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 90);

			let thingDTO = req.body;
			if (!thingDTO)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 91);

			let blResult = await thingsMngr.updateThing(user, thingId, thingDTO);
			if (!blResult)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 95);

			if (blResult.usersIdsToNotify) {
				if (!blResult.thingDTOs)
					throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 96);
				
				RealtimeNotifier.onUpdateThing(blResult.usersIdsToNotify, blResult.thingDTOs);
			}

			// TODO: According to the restful paradigm what should the PUT return?
			if (!blResult.thingDTO)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 97);

			res.json(blResult.thingDTO);

		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 89));
			return;
		}
	})(req, res, next);
});

// Update Thing Value
router.put("/:id/value", async function (req, res, next) {
	await passport.authenticate(["localapikey", "bearer"], { session: false }, async function(err, user, info) {
		try {			
			if (err)
				throw err; 

			if (!user)
				throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 104);

			let thingId = req.params.id;
			if (!thingId)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 105);

			let value = req.body;
			if (!value)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 106);

			if (typeof value !== "object")
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is not a valid JSON object", 131);

			// logger.info("PUT ../api/things/" + thingId + " Value: " + JSON.stringify(value),{ code: 130 });
			logger.info("PUT before thingsMngr.updateThingValue and RealtimeNotifier.onUpdateThingValue", { code: 130 });
			logger.info("PUT ../api/things/" + thingId,{ code: 130 });

			let blResult = await thingsMngr.updateThingValue(user, thingId, value, false);
			if (!blResult) // Nothing to notify
				return; // ToDo: According to the restful paradigm, what should the PUT return?

			RealtimeNotifier.onUpdateThingValue(blResult, thingId, value, false);

			res.json(value); // ToDo: According to the restful paradigm, what should the PUT return?

			logger.info("PUT after thingsMngr.updateThingValue and RealtimeNotifier.onUpdateThingValue", { code: 130 });
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 89));
			return;
		}
	})(req, res, next);
});

// Send Thing Command
router.put("/:id/cmd", async function (req, res, next) {
	await passport.authenticate(["localapikey", "bearer"], { session: false }, 
		async function(err, user, info) {
			try {
				if (err)
					throw err;

				if (!user)
					throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 113);

				let thingId = req.params.id;
				if (!thingId)
					throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 114);

				let value = req.body;
				if (!value)
					throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 115);

				let blResult = await thingsMngr.updateThingValue(user, thingId, value, true);
				if (!blResult)
					return; // ToDo: According to the restful paradigm, what should the PUT return?

				RealtimeNotifier.onUpdateThingValue(blResult, thingId, value, true);
				
				res.json(value); // ToDo: According to the restful paradigm, what should the PUT return?
			}  catch(e)  {
				if (e instanceof utils.ErrorCustom) {
					next(e);
					return;
				}
				next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 116));
				return;
			}
		})(req, res, next);
});
