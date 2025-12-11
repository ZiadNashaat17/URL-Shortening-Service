import { nanoid } from "nanoid";
import Url from "../models/urlModel.js";
import AppError from "../util/appError.js";

export const createUrl = async (req, res, _next) => {
	const originalUrl = req.body.originalUrl;
	const base = process.env.BASE;

	let url = req.user
		? await Url.findOne({ user: req.user._id, originalUrl })
		: await Url.findOne({ originalUrl, user: null });

	if (!url) {
		const urlId = nanoid();
		const shortUrl = `${base}/${urlId}`;

		url = await Url.create({ urlId, originalUrl, shortUrl, user: req.user?._id || null });
	}

	res.status(201).json({
		status: "success",
		url,
	});
};

export const getUrl = async (req, res, next) => {
	const url = req.user
		? await Url.findOne({ user: req.user._id, urlId: req.params.urlId })
		: await Url.findOne({ urlId: req.params.urlId, user: null });

	if (url) {
		await Url.updateOne({ urlId: req.params.urlId }, { $inc: { clicks: 1 } });
		return res.redirect(url.originalUrl);
	} else {
		return next(new AppError("Not found", 404));
	}
};
