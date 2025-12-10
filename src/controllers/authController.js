import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/userModel.js";
import AppError from "../util/appError.js";
import sendEmail from "../util/email.js";
import emailTemplateFun from "../util/emailTemplateFun.js";
import filterObj from "../util/filterObj.js";

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);

	user.password = undefined;
	user.passwordChangedAt = undefined;

	res.status(statusCode).json({
		status: "success",
		token,
		data: { user },
	});
};

export const register = async (req, res, next) => {
	const filteredBody = filterObj(req.body, "name", "email", "password", "passwordConfirm");

	if (filteredBody.password !== filteredBody.passwordConfirm) {
		return next(new AppError("Passwords are not the same!", 400));
	}

	if (!validator.isEmail(filteredBody.email)) {
		return next(new AppError("Enter valid email", 400));
	}

	delete filteredBody.passwordConfirm;
	const newUser = await User.create(filteredBody);

	const verificationToken = await newUser.generateEmailVerificationToken();
	await newUser.save();

	const verifyURL = `${req.protocol}://${req.get("host")}/api/user/verify-email/${verificationToken}`;

	const emailTemplate = emailTemplateFun("Verify Email Request", newUser.name, verifyURL);

	await sendEmail(newUser.email, "Verify Email Request", "Hello", emailTemplate);

	res.status(201).json({
		status: "success",
		message: "Account created successfully. Please check your inbox and verify your email.",
	});
};

export const verifyEmail = async (req, res, next) => {
	const verificationToken = req.params.verifyToken;
	const hashedVerificationToken = crypto
		.createHash("sha256")
		.update(verificationToken)
		.digest("hex");

	const user = await User.findOne({
		emailVerToken: hashedVerificationToken,
	});

	if (!user) {
		return next(new AppError("Invalid token"));
	}

	if (user.emailVerTokenExp < Date.now()) {
		return next(new AppError("Token expired!", 400));
	}

	user.isVerified = true;
	user.emailVerToken = undefined;
	user.emailVerTokenExp = undefined;

	await user.save();

	createSendToken(user, 200, res);
};

export const login = async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError("Email and password are required!", 400));
	}

	const user = await User.findOne({ email, active: true }).select("+password");

	if (!user) return next(new AppError("No user found with this email!", 404));

	if (!(await user.isPasswordCorrect(password, user.password))) {
		return next(new AppError("Incorrect email or password!", 400));
	}

	if (!user.isVerified) {
		return next(
			new AppError("Email is not verified! Please verify your email and try again.", 401),
		);
	}

	createSendToken(user, 200, res);
};

export const deactivateUser = async (req, res, _next) => {
	await User.findOneAndUpdate({ _id: req.user._id, isVerified: true }, { active: false });

	res.status(201).json({
		status: "success",
		message: "User account is deactivated, you have 30 days to reactivate",
		data: null,
	});
};

export const reactivateUser = async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new AppError("No user found with this email", 404));
	}

	if (!(await user.isPasswordCorrect(password, user.password))) {
		return next(new AppError("Incorrect email or password"), 400);
	}

	if (!user.isVerified) {
		return next(
			new AppError("Email is not verified! Please verify your email and try again.", 401),
		);
	}

	user.active = true;
	await user.save();

	res.status(201).json({
		status: "success",
		message: "User account reactivated successfully.",
		data: { user },
	});
};

export const changePassword = async (req, res, next) => {
	const { currentPassword, newPassword, newPasswordConfirm } = req.body;

	if (!currentPassword || !newPassword) {
		return next(new AppError("Please enter the current password and new password!", 400));
	}

	const user = await User.findOne({ _id: req.user._id }).select("+password");

	if (!(await user.isPasswordCorrect(currentPassword, user.password))) {
		return next(new AppError("The current password you entered is incorrect!", 400));
	}

	if (newPassword !== newPasswordConfirm) {
		return next(new AppError("Passwords are not the same!", 400));
	}

	user.password = newPassword;
	await user.save();

	user.password = undefined;

	res.status(201).json({
		status: "success",
		message: "Password changed successfully!",
		data: { user },
	});
};

export const forgotPassword = async (req, res, next) => {
	const { email } = req.body;

	if (!validator.isEmail(email)) {
		return next(new AppError("Enter valid email!", 400));
	}

	const user = await User.findOne({ email });

	if (!user) {
		return next(new AppError("This email is not registered!", 400));
	}

	if (!user.isVerified) {
		return next(
			new AppError("Email is not verified! Please verify your email and try again.", 401),
		);
	}

	const resetToken = await user.generateResetToken();
	await user.save();

	const resetURL = `${req.protocol}://${req.get("host")}/api/user/reset-password/${resetToken}`;

	const emailTemplate = emailTemplateFun("Password Reset Request", user.name, resetURL);

	await sendEmail(email, "Password Reset Request", "Hello", emailTemplate);

	res.status(200).json({
		status: "success",
		message: "Password reset link sent to your email!",
	});
};

export const resetPassword = async (req, res, next) => {
	const resetToken = req.params.resetToken;
	const { password, passwordConfirm } = req.body;

	if (password !== passwordConfirm) {
		return next(new AppError("Passwords are not the same!", 400));
	}

	const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	const user = await User.findOne({
		passwordResetToken: hashedToken,
	});

	if (!user) {
		return next(new AppError("Invalid token"));
	}

	if (user.passwordResetTokenExp < Date.now()) {
		return next(new AppError("Token expired!", 400));
	}

	if (!user.isVerified) {
		return next(
			new AppError("Email is not verified! Please verify your email and try again.", 401),
		);
	}

	user.password = password;
	user.passwordResetToken = undefined;
	user.passwordResetTokenExp = undefined;

	await user.save();

	createSendToken(user, 201, res);
};
