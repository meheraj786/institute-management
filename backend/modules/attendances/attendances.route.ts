import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as attendanceController from "./attendances.controller";
import {
  bulkAttendanceSchema,
  createAttendanceSchema,
  updateAttendanceSchema,
} from "./attendances.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN", "TEACHER"));
router.get("/roster", attendanceController.roster);
router.post(
  "/bulk",
  validateRequest(bulkAttendanceSchema),
  attendanceController.bulk,
);
router.get("/", attendanceController.list);
router.get("/:id", attendanceController.get);
router.post(
  "/",
  validateRequest(createAttendanceSchema),
  attendanceController.create,
);
router.patch(
  "/:id",
  validateRequest(updateAttendanceSchema),
  attendanceController.update,
);
router.put(
  "/:id",
  validateRequest(updateAttendanceSchema),
  attendanceController.update,
);
router.delete("/:id", attendanceController.remove);

export default router;
