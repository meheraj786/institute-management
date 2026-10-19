import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as sectionsController from "./sections.controller";
import {
  createSectionSchema,
  updateSectionSchema,
} from "./sections.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", sectionsController.list);
router.get("/:id", sectionsController.get);
router.post(
  "/",
  validateRequest(createSectionSchema),
  sectionsController.create,
);
router.patch(
  "/:id",
  validateRequest(updateSectionSchema),
  sectionsController.update,
);
router.put(
  "/:id",
  validateRequest(updateSectionSchema),
  sectionsController.update,
);
router.delete("/:id", sectionsController.remove);

export default router;
