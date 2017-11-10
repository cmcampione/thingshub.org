"use strict";

const HttpStatus 		= require("http-status-codes");
const express 			= require("express");
const passport 			= require("passport");

const utils 			= require("../utils.js");
const usersMngr 		= require("../bl/usersMngr.js");
const dtos 				= require("../dtos");

const router = express.Router();

/**
 * Render the index.ejs or index-with-code.js depending on if query param has code or not
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @param   {Object} next - The next
 * @returns {undefined}
 */

router.get("/things", 
	passport.authenticate("localapikey", { session: false, failureRedirect: "/api/unauthorized" }),
	(req, res, next) => {
		try {
			res.json("first thing");
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(HttpStatus.INTERNAL_SERVER_ERROR, e.message, 8));
		}
	});

module.exports = router;