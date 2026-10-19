import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as academicYearsController from "./academic-years.controller";
import {
  createAcademicYearSchema,
  updateAcademicYearSchema,
} from "./academic-years.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", academicYearsController.list);
router.get("/:id", academicYearsController.get);
router.post(
  "/",
  validateRequest(createAcademicYearSchema),
  academicYearsController.create,
);
router.patch(
  "/:id",
  validateRequest(updateAcademicYearSchema),
  academicYearsController.update,
);
router.put(
  "/:id",
  validateRequest(updateAcademicYearSchema),
  academicYearsController.update,
);
router.delete("/:id", academicYearsController.remove);

export default router;
