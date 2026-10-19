import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import {
  classesController,
  classSectionsController,
} from "./classes.controller";
import {
  createClassSchema,
  createClassSectionSchema,
  updateClassSchema,
  updateClassSectionSchema,
} from "./classes.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/sections", classSectionsController.list);
router.get("/sections/:id", classSectionsController.get);
router.post(
  "/sections",
  validateRequest(createClassSectionSchema),
  classSectionsController.create,
);
router.patch(
  "/sections/:id",
  validateRequest(updateClassSectionSchema),
  classSectionsController.update,
);
router.put(
  "/sections/:id",
  validateRequest(updateClassSectionSchema),
  classSectionsController.update,
);
router.delete("/sections/:id", classSectionsController.remove);
router.get("/", classesController.list);
router.get("/:id", classesController.get);
router.post("/", validateRequest(createClassSchema), classesController.create);
router.patch(
  "/:id",
  validateRequest(updateClassSchema),
  classesController.update,
);
router.put(
  "/:id",
  validateRequest(updateClassSchema),
  classesController.update,
);
router.delete("/:id", classesController.remove);

export default router;
