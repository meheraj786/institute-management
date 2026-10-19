import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as examsController from "./exams.controller";
import {
  bulkMarksSchema,
  createExamSchema,
  createExamSubjectSchema,
  createMarkSchema,
  updateExamSchema,
  updateExamSubjectSchema,
  updateMarkSchema,
} from "./exams.validation";

const router = Router();
router.get(
  "/results",
  authenticate,
  authorize("ADMIN", "TEACHER", "STUDENT"),
  examsController.results,
);
router.post(
  "/marks/bulk",
  authenticate,
  authorize("ADMIN", "TEACHER"),
  validateRequest(bulkMarksSchema),
  examsController.bulkMarks,
);

router.use("/subjects", authenticate, authorize("ADMIN", "TEACHER"));
router.get("/subjects", examsController.examSubjectsController.list);
router.get("/subjects/:id", examsController.examSubjectsController.get);
router.post(
  "/subjects",
  validateRequest(createExamSubjectSchema),
  examsController.examSubjectsController.create,
);
router.patch(
  "/subjects/:id",
  validateRequest(updateExamSubjectSchema),
  examsController.examSubjectsController.update,
);
router.put(
  "/subjects/:id",
  validateRequest(updateExamSubjectSchema),
  examsController.examSubjectsController.update,
);
router.delete("/subjects/:id", examsController.examSubjectsController.remove);

router.use("/marks", authenticate, authorize("ADMIN", "TEACHER"));
router.get("/marks", examsController.marksController.list);
router.get("/marks/:id", examsController.marksController.get);
router.post(
  "/marks",
  validateRequest(createMarkSchema),
  examsController.marksController.create,
);
router.patch(
  "/marks/:id",
  validateRequest(updateMarkSchema),
  examsController.marksController.update,
);
router.put(
  "/marks/:id",
  validateRequest(updateMarkSchema),
  examsController.marksController.update,
);
router.delete("/marks/:id", examsController.marksController.remove);

router.use(authenticate, authorize("ADMIN", "TEACHER"));
router.get("/", examsController.examsController.list);
router.get("/:id", examsController.examsController.get);
router.post(
  "/",
  validateRequest(createExamSchema),
  examsController.examsController.create,
);
router.patch(
  "/:id",
  validateRequest(updateExamSchema),
  examsController.examsController.update,
);
router.put(
  "/:id",
  validateRequest(updateExamSchema),
  examsController.examsController.update,
);
router.delete("/:id", examsController.examsController.remove);

export default router;
