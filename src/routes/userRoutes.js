import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { getUser, updateUser } from "../controllers/userController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.post("/register", authController.register);
router.get("/verify-email/:verifyToken", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:resetToken", authController.resetPassword);
router.patch("/reactivate-user", authController.reactivateUser);

router.use(authenticate);
router.get("/", getUser);
router.patch("/update-user", updateUser);
router.patch("/change-password", authController.changePassword);
router.patch("/deactivate-user", authController.deactivateUser);

export default router;
