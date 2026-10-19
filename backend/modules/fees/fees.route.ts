import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as feesController from "./fees.controller";
import {
  createFeeCollectionSchema,
  createFeeHeadSchema,
  createFeeStructureSchema,
  updateFeeCollectionSchema,
  updateFeeHeadSchema,
  updateFeeStructureSchema,
} from "./fees.validation";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/students/search", feesController.searchStudents);
router.get("/students/:studentId/due", feesController.studentDue);

router.get("/heads", feesController.feeHeadsController.list);
router.get("/heads/:id", feesController.feeHeadsController.get);
router.post(
  "/heads",
  validateRequest(createFeeHeadSchema),
  feesController.feeHeadsController.create,
);
router.patch(
  "/heads/:id",
  validateRequest(updateFeeHeadSchema),
  feesController.feeHeadsController.update,
);
router.put(
  "/heads/:id",
  validateRequest(updateFeeHeadSchema),
  feesController.feeHeadsController.update,
);
router.delete("/heads/:id", feesController.feeHeadsController.remove);

router.get("/structures", feesController.feeStructuresController.list);
router.get("/structures/:id", feesController.feeStructuresController.get);
router.post(
  "/structures",
  validateRequest(createFeeStructureSchema),
  feesController.feeStructuresController.create,
);
router.patch(
  "/structures/:id",
  validateRequest(updateFeeStructureSchema),
  feesController.feeStructuresController.update,
);
router.put(
  "/structures/:id",
  validateRequest(updateFeeStructureSchema),
  feesController.feeStructuresController.update,
);
router.delete("/structures/:id", feesController.feeStructuresController.remove);

router.get("/", feesController.feeCollectionsController.list);
router.get("/:id", feesController.feeCollectionsController.get);
router.post(
  "/",
  validateRequest(createFeeCollectionSchema),
  feesController.feeCollectionsController.create,
);
router.patch(
  "/:id",
  validateRequest(updateFeeCollectionSchema),
  feesController.feeCollectionsController.update,
);
router.put(
  "/:id",
  validateRequest(updateFeeCollectionSchema),
  feesController.feeCollectionsController.update,
);
router.delete("/:id", feesController.feeCollectionsController.remove);

export default router;
