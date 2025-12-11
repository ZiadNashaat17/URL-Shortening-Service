import { nanoid } from "nanoid";
import Url from "../models/urlModel.js";
import AppError from "../util/appError.js";

export const createUrl = async (req, res, _next) => {
	const originalUrl = req.body.originalUrl;
	const base = process.env.BASE;

	let url = await Url.findOne({ originalUrl });

	if (!url) {
		const urlId = nanoid();
		const shortUrl = `${base}/${urlId}`;

		url = await Url.create({ urlId, originalUrl, shortUrl });
	}

	res.status(201).json({
		status: "success",
		url,
	});
};

export const getUrl = async (req, res, next) => {
	const url = await Url.findOne({ urlId: req.params.urlId });

	if (url) {
		await Url.updateOne({ urlId: req.params.urlId }, { $inc: { clicks: 1 } });
		return res.redirect(url.originalUrl);
	} else {
		return next(new AppError("Not found", 404));
	}
};
