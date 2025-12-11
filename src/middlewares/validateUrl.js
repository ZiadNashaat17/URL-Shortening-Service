import { URL } from "node:url";
import AppError from "../util/appError.js";

export default (req, _res, next) => {
	try {
		new URL(req.body.originalUrl);

		next();
	} catch (error) {
		return next(new AppError(error.message, error.status));
	}
};
