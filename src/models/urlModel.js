import { model, Schema } from "mongoose";

const urlSchema = new Schema(
	{
		urlId: { type: String, required: true },
		shortUrl: { type: String, required: true },
		originalUrl: { type: String, required: true },
		clicks: { type: Number, required: true, default: 0, max: 6 },
		user: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

const Url = model("Url", urlSchema);

export default Url;
