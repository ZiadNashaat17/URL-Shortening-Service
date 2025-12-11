import { Router } from "express";
import { createUrl, getUrl } from "../controllers/urlController.js";
import optionalAuthenticate from "../middlewares/optionalAuthenticate.js";
import validateUrl from "../middlewares/validateUrl.js";

const router = Router();

router.post("/", optionalAuthenticate, validateUrl, createUrl);
router.get("/:urlId", optionalAuthenticate, getUrl);

export default router;
