import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as studentsController from "./students.controller";
import {
  createStudentEnrollmentSchema,
  createStudentSchema,
  updateStudentEnrollmentSchema,
  updateStudentSchema,
} from "./students.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/generate-id", studentsController.generateId);
router.get("/enrollments", studentsController.enrollmentsController.list);
router.get("/enrollments/:id", studentsController.enrollmentsController.get);
router.post(
  "/enrollments",
  validateRequest(createStudentEnrollmentSchema),
  studentsController.enrollmentsController.create,
);
router.patch(
  "/enrollments/:id",
  validateRequest(updateStudentEnrollmentSchema),
  studentsController.enrollmentsController.update,
);
router.put(
  "/enrollments/:id",
  validateRequest(updateStudentEnrollmentSchema),
  studentsController.enrollmentsController.update,
);
router.delete(
  "/enrollments/:id",
  studentsController.enrollmentsController.remove,
);

router.get("/", studentsController.studentsController.list);
router.get("/:id", studentsController.studentsController.get);
router.post(
  "/",
  validateRequest(createStudentSchema),
  studentsController.studentsController.create,
);
router.patch(
  "/:id",
  validateRequest(updateStudentSchema),
  studentsController.studentsController.update,
);
router.put(
  "/:id",
  validateRequest(updateStudentSchema),
  studentsController.studentsController.update,
);
router.delete("/:id", studentsController.studentsController.remove);

export default router;
