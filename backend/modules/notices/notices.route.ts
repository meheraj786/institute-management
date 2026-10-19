import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import validateRequest from "../../middleware/validateRequest";
import * as noticesController from "./notices.controller";
import { createNoticeSchema, updateNoticeSchema } from "./notices.validation";

const router = Router();
router.use("/manage", authenticate, authorize("ADMIN"));
router.get("/manage", noticesController.list);
router.get("/manage/:id", noticesController.get);
router.post(
  "/manage",
  validateRequest(createNoticeSchema),
  noticesController.create,
);
router.patch(
  "/manage/:id",
  validateRequest(updateNoticeSchema),
  noticesController.update,
);
router.put(
  "/manage/:id",
  validateRequest(updateNoticeSchema),
  noticesController.update,
);
router.delete("/manage/:id", noticesController.remove);
router.post(
  "/:id/publish",
  authenticate,
  authorize("ADMIN"),
  noticesController.publish,
);
router.get("/", noticesController.publicList);
router.get("/:id", noticesController.publicGet);

export default router;
