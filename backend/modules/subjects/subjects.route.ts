import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import {
  subjectsController,
  classSubjectsController,
} from "./subjects.controller";
import {
  createClassSubjectSchema,
  createSubjectSchema,
  updateClassSubjectSchema,
  updateSubjectSchema,
} from "./subjects.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/assignments", classSubjectsController.list);
router.get("/assignments/:id", classSubjectsController.get);
router.post(
  "/assignments",
  validateRequest(createClassSubjectSchema),
  classSubjectsController.create,
);
router.patch(
  "/assignments/:id",
  validateRequest(updateClassSubjectSchema),
  classSubjectsController.update,
);
router.put(
  "/assignments/:id",
  validateRequest(updateClassSubjectSchema),
  classSubjectsController.update,
);
router.delete("/assignments/:id", classSubjectsController.remove);
router.get("/", subjectsController.list);
router.get("/:id", subjectsController.get);
router.post(
  "/",
  validateRequest(createSubjectSchema),
  subjectsController.create,
);
router.patch(
  "/:id",
  validateRequest(updateSubjectSchema),
  subjectsController.update,
);
router.put(
  "/:id",
  validateRequest(updateSubjectSchema),
  subjectsController.update,
);
router.delete("/:id", subjectsController.remove);

export default router;
