import { promisify } from "node:util";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export default async (req, _res, next) => {
	try {
		let token;

		if (req.headers.authorization?.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		if (!token) {
			return next();
		}

		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
		const currentUser = await User.findOne({ _id: decoded.id });

		if (currentUser?.isVerified && !currentUser.passwordChangedAfterToken(decoded.iat)) {
			req.user = currentUser;
		}

		next();
	} catch (_error) {
		next();
	}
};
