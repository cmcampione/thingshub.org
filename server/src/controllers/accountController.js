"use strict";

import path from "path";
import nodemailer from "nodemailer";
import httpStatusCodes from "http-status-codes";
import express from "express";
import passport from "passport";
import { param, body, validationResult } from "express-validator";

import ejs from	"ejs";

import * as utils from "../utils.js";
import * as usersMngr from "../bl/usersMngr.js";
import * as usersPendingMngr from "../bl/usersPendingMngr.js";
import * as dtos from "../../../common/src/dtos.mjs";

const __dirname = path.resolve();

export const router = express.Router();

// create reusable transporter object using the default SMTP transport
let transporter = null;

async function SendConfirmationEmailByOnlyEmail(email, culture, confirmationToken) {
	// create reusable transporter object using the default SMTP transport
	if (!transporter) {
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: (process.env.SMTP_SECURE === "true"), // secure:true for port 465, secure:false for port 587
			requireTLS: true,
			tls: {
				rejectUnauthorized: false,
			},
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_USER_PASSWORD,
			},
		});
	}

	const ConfirmationByOnlyEmailUrl = `${process.env.CONFIRMATION_URL_BY_ONLY_EMAIL}?ct=${confirmationToken}`;

	let subject = process.env[`CONFIRMATION_EMAIL_SUBJECT_${culture}`];
	if (!subject) {
		subject = process.env.CONFIRMATION_EMAIL_SUBJECT_DEFAULT;
	}

	const html = await new Promise((resolve, reject) => {
		var ejsFile = path.join(__dirname, "src/views/confirmByOnlyEmail-" + culture + ".ejs");
		ejs.renderFile(ejsFile, {
			title: process.env.APPLICATION_NAME,
			confirmByOnlyEmailUrl : ConfirmationByOnlyEmailUrl,
			email : process.env.SUPPORT_EMAIL,
		}, (err, renderedHtml) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(renderedHtml);
		});
	});

	// setup email data with unicode symbols
	const mailOptions = {
		from: process.env.CONFIRMATION_EMAIL_FROM, // sender address
		to: email, // list of receivers
		subject, // Subject line
		text: ConfirmationByOnlyEmailUrl, // plain text body
		html, // html body
	};

	return new Promise((resolve, reject) => {
		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				reject(error);
				return error;
			}
			resolve(info);
			return info;
		});
	});
}

/**
 * Render the index.ejs or index-with-code.js depending on if query param has code or not
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @param   {Object} next - The next
 * @returns {undefined}
 */

router.get("/registerByOnlyEmail/:email/:culture", [
	param("email", "Email is not valid").normalizeEmail({ gmail_remove_dots: false }).isEmail()
],
async (req, res, next) => {
	try {
		try {
			validationResult(req).throw();
		} catch (e) {
			throw (new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, e.mapped(), 2));
		}

		const email = req.params.email;
		const culture = req.params.culture;

		const user = await usersMngr.findUserByUsername(email);
		if (user) {
			// The client can redirect user to login page and recovery password
			res.json(new dtos.RegisterByOnlyEmailDTO(email,"", dtos.RegisterByOnlyEmailStatus.UserAlreadyRegistered));
			return;
		}

		let userPending = await usersPendingMngr.findUserByEmail(email);
		if (userPending) {
			// TODO: It may happen that the email is not sent for some problem, but the pending mail
			// has been created,
			// If this happen, you must notify the Group of Administrators

			await SendConfirmationEmailByOnlyEmail(email, culture, userPending.confirmationToken);

			// The user had tried to register, but for some reason did not confirm,
			// he attempted to enter the email and sent the confirmation email again
			// The token is sent by email, no need to return to the DTO for security issues
			// The client (for example, TiTaggoPublicPortal) should postpone the User
			// to a page informing the User that he should receive an email to confirm the account
			// The e-mail link should point to the client and submit a registration page
			// with Name = "No Name", Surname = "No Surname", email / username =
			// and the Password field to be entered
			res.json(new dtos.RegisterByOnlyEmailDTO(email, "", dtos.RegisterByOnlyEmailStatus.ConfirmPendingEmailSent));
			return;
		}

		userPending = await usersPendingMngr.createUserPending(email);

		// TODO: It may happen that the email is not sent for some problem, but the pending mail
		// has been created,
		// If this is the case, you must notify the Group of Administrators

		await SendConfirmationEmailByOnlyEmail(email, culture, userPending.confirmationToken);

		// The token is sent by email, no need to return to the DTO for security issues
		// The client (for example, TiTaggoPublicPortal) should postpone the User
		// to a page informing the User that he should receive an email to confirm the account
		// The e-mail link should point to the client and submit a registration page
		// with Name = "No Name", Surname = "No Surname", email / username =
		// and the Password field to be entered
		res.json(new dtos.RegisterByOnlyEmailDTO(email, "", dtos.RegisterByOnlyEmailStatus.ConfirmPendingEmailSent));
	}  catch (e)  {
		if (e instanceof utils.ErrorCustom) {
			next(e);
			return;
		}
		next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 3));
	}
});

router.post("/confirmAccountByOnlyEmail", [
	body("email", "Email is not valid").normalizeEmail({ gmail_remove_dots: false }).isEmail(),
	body("name", "Name is not valid").notEmpty(),
	body("password", `Password must be at least ${process.env.PASSWORD_MIN_LEN} characters long`).isLength({min : process.env.PASSWORD_MIN_LEN}),
	body("confirmationToken", "Confirmation Token not valid").notEmpty()
],
async (req, res, next) => {
	try {
		// if a password has been provided, then a confirmation must also be provided.
		if (req.body.password) {
			await body("confirmPassword")
				.equals(req.body.password).withMessage("Passwords do not match")
				.run(req);
		}
		try {
			validationResult(req).throw();
		} catch (e) {
			throw (new utils.ErrorCustom(httpStatusCodes.BAD_REQUEST, e.mapped(), 4));
		}

		const email = req.body.email;
		const name = req.body.name;
		const password = req.body.password;
		const confirmationToken = req.body.confirmationToken;

		let user = await usersMngr.findUserByUsername(email);
		if (user) {
			throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, "User registration already exists", 5);
		}

		const userPending = await usersPendingMngr.findUserByEmailAndConfirmToken(email,
			confirmationToken);
		if (!userPending) {
			throw new utils.ErrorCustom(httpStatusCodes.NOT_FOUND, "User pending registration does not exist", 6);
		}

		user = await usersMngr.createUser(email, name, password, userPending.registrationDate, true,
			confirmationToken, Date.now());

		// TODO: If "usersPendingMngr.deleteUser" fails, a pending User remains in usersMngr
		await usersPendingMngr.deleteUser(userPending);

		res.json(utils.MappingModelAndDTO.toUserDTO(user, false));
	}  catch (e) {
		if (e instanceof utils.ErrorCustom) {
			next(e);
			return;
		}
		next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 7));
	}
});

router.post("/login", 
	async function (req, res, next) {
		passport.authenticate(["local", "basic"], { session: false }, async function(err, user, info) {
			try {
				if (err) { 
					throw err; 
				}
				if (!user) { 
					throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 107);
				}

				res.json({ 
					access_token: utils.createToken({ 
						sub : user._id.toString(), 
						exp : parseInt(process.env.TOKEN_EXPIRATION),
						name: user.name }),
					token_type: "bearer"
				});

			}  catch (e)  {
				if (e instanceof utils.ErrorCustom) {
					next(e);
					return;
				}
				next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 108));
				return;
			}

		})(req, res, next);
	});

// ToDo: Is it necessary the authentication?
router.get("/logout", async function (req, res, next) {
	passport.authenticate(["bearer"], { session: false }, async function(err, user, info) {
		try {
			if (err)
				throw new err;
			if (!user)
				throw new utils.ErrorCustom(httpStatusCodes.UNAUTHORIZED, httpStatusCodes.getStatusText(httpStatusCodes.UNAUTHORIZED), 109);
			req.logout();
			res.send("");
		}  catch (e)  {
			if (e instanceof utils.ErrorCustom) {
				next(e);
				return;
			}
			next(new utils.ErrorCustom(httpStatusCodes.INTERNAL_SERVER_ERROR, e.message, 110));
		}

	})(req, res, next);
});
