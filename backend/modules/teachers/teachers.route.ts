import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import {
  assignmentsController,
  teachersController,
} from "./teachers.controller";
import {
  createTeacherAssignmentSchema,
  createTeacherSchema,
  updateTeacherAssignmentSchema,
  updateTeacherSchema,
} from "./teachers.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/assignments", assignmentsController.list);
router.get("/assignments/:id", assignmentsController.get);
router.post(
  "/assignments",
  validateRequest(createTeacherAssignmentSchema),
  assignmentsController.create,
);
router.patch(
  "/assignments/:id",
  validateRequest(updateTeacherAssignmentSchema),
  assignmentsController.update,
);
router.put(
  "/assignments/:id",
  validateRequest(updateTeacherAssignmentSchema),
  assignmentsController.update,
);
router.delete("/assignments/:id", assignmentsController.remove);

router.get("/", teachersController.list);
router.get("/:id", teachersController.get);
router.post(
  "/",
  validateRequest(createTeacherSchema),
  teachersController.create,
);
router.patch(
  "/:id",
  validateRequest(updateTeacherSchema),
  teachersController.update,
);
router.put(
  "/:id",
  validateRequest(updateTeacherSchema),
  teachersController.update,
);
router.delete("/:id", teachersController.remove);

export default router;
