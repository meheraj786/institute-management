import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as usersController from "./users.controller";
import { createUserSchema, updateUserSchema } from "./users.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", usersController.list);
router.get("/:id", usersController.get);
router.post("/", validateRequest(createUserSchema), usersController.create);
router.patch("/:id", validateRequest(updateUserSchema), usersController.update);
router.put("/:id", validateRequest(updateUserSchema), usersController.update);
router.delete("/:id", usersController.remove);

export default router;
