import { config } from "dotenv";

config({ path: "./config.env" });

import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./middlewares/errorController.js";
import urlRouter from "./routes/urlRoutes.js";
import userRouter from "./routes/userRoutes.js";
import AppError from "./util/appError.js";

const app = express();
const limit = rateLimit({
	max: 10000,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests from this IP, please try again in an hour!",
});

app.use(express.json());
app.use(helmet());
app.use("/api", limit);

if (process.env.NODE_ENV.trim() === "development") {
	app.use(morgan("dev"));
}

app.get("/favicon.ico", (_req, res) => res.status(204).end());

app.use("/api/user", userRouter);
app.use("/api/url", urlRouter);

app.use((req, _res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
