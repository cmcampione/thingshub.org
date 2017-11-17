"use strict";

const httpStatus 		= require("http-status-codes");
const express 			= require("express");
const passport 			= require("passport");

const utils 			= require("../utils.js");
const usersMngr 		= require("../bl/usersMngr.js");
const dtos 				= require("../dtos");
const ClientsConnectorsManager = require("../clientsConnectorsManager");

const router = express.Router();

router.get("/things", function(req, res, next) {
	passport.authenticate("localapikey", function(err, user, info) {
		try {
			if (err) { 
				return next(err); 
			}
			if (!user) { 
				return next(new utils.ErrorCustom(httpStatus.UNAUTHORIZED, httpStatus.getStatusText(httpStatus.UNAUTHORIZED), 10));
			}

			res.json("first thing");

			let usersIds = [];
			usersIds.push(user._id);
			ClientsConnectorsManager.api(usersIds, "first thing");
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatus.INTERNAL_SERVER_ERROR, e.message, 8));
		}
	})(req, res, next);
});

module.exports = router;