// import { constants } from "zlib";

"use strict";

const httpStatusCodes 		= require("http-status-codes");
const express 			= require("express");
const passport 			= require("passport");

const utils 			= require("../utils.js");
const constants 		= require("../../../common/src/constants");
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
				return next(new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 10));
			}

			let parentThingId = req.query.parentThingId;
			let thingFilter = req.query.thingFilter ? JSON.parse(req.query.thingFilter) : null;
			let valueFilter = req.query.valueFilter ? JSON.parse(req.query.valueFilter) : null;
			let orderBy = req.query.orderBy ? JSON.parse(req.query.orderBy) : null;
			let skip = req.query.skip ? parseInt(req.query.skip) : 0;
			let top = req.query.top ? parseInt(req.query.top) : parseInt(process.env.GET_THINGS_MAX_PAGESIZE);

			let paging = utils.validateAndFixInputPaging(skip, top);

			let blResult = await thingsMngr.getThings(user, parentThingId, thingFilter, valueFilter, orderBy, paging.skip, paging.top);
			if (!blResult || !blResult.top || !blResult.skip || !blResult.totalItems)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 98);

			res.setHeader("Content-Range", "Items " + blResult.top + "-" + skip + "/" + blResult.totalItems);

			res.json(blResult.thingsDTO);
			
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 8));
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
			if (!thingId)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "Thing's Id can't be null", 93);

			let blResult = await thingsMngr.getThing(user, thingId, constants.ThingDeletedStates.NoMatter);
			if (!blResult)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 99);

			res.json(blResult);

		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 50));
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
				return next(new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 22));
			}

			let thingDTO = req.body;
			if (!thingDTO)
				throw new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, "The body message is empty", 92);

			let blResult = await thingsMngr.createThing(user, thingDTO);
			if (!blResult || !blResult.usersIdsToNotify || !blResult.thingDTO)
				throw new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, "Result not valid", 100);

			ClientsConnectorsManager.onCreateThing(blResult.usersIdsToNotify, blResult.thingDTO);

			res.json(blResult.thingDTO);

		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 23));
		}
	})(req, res, next);
});

// Update Thing
router.put("/:id", async function (req, res, next){
	passport.authenticate("localapikey", async function(err, user, info) {
		try {
			if (err)
				return next(err); 

			if (!user)
				return next(new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 88));

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
				
				ClientsConnectorsManager.onUpdateThing(blResult.usersIdsToNotify, blResult.thingDTOs);
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
		}
	})(req, res, next);
});

module.exports = router;