import crypto from "node:crypto";
import { compare, hash } from "bcrypt";
import { model, Schema } from "mongoose";
import validator from "validator";

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		email: {
			type: String,
			required: true,
			unique: true,
			validator: validator.isEmail,
			lowercase: true,
			trim: true,
			index: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			trim: true,
			select: false,
		},
		active: { type: Boolean, default: true },
		passwordChangedAt: { type: Date, select: false },
		isVerified: { type: Boolean, default: false },
		emailVerToken: String,
		emailVerTokenExp: Date,
		passwordResetToken: String,
		passwordResetTokenExp: Date,
	},
	{
		timestamps: true,
	},
);

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;

	this.password = await hash(this.password, 12);
	this.passwordChangedAt = Date.now();
});

userSchema.pre("save", function () {
	if (!this.isModified("password") || this.isNew) return;

	this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.isPasswordCorrect = async (candidatePassword, userPassword) => {
	return await compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfterToken = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

		return JWTTimestamp < changedAtTimestamp;
	}

	return false;
};

userSchema.methods.generateResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
	this.passwordResetTokenExp = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
	const verificationToken = crypto.randomBytes(32).toString("hex");

	this.emailVerToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
	this.emailVerTokenExp = Date.now() + 10 * 60 * 1000;

	return verificationToken;
};

const User = model("User", userSchema);

export default User;
