import { Router } from "express";
import * as authController from "./auth.controller";
import { authenticate } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);

export default router;
