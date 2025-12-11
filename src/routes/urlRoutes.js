import { Router } from "express";
import { createUrl, getUrl } from "../controllers/urlController.js";
import validateUrl from "../middlewares/validateUrl.js";

const router = Router();

router.post("/", validateUrl, createUrl);
router.get("/:urlId", getUrl);

export default router;
