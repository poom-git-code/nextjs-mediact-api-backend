import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware";
import * as RequestShiftController from "../controllers/requestShiftController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Default group
router.get("/request-shift", RequestShiftController.getAllRequestShifts);
router.get("/request-shift/:id", RequestShiftController.getRequestShiftById);
router.post("/request-shift", RequestShiftController.createRequestShift);
router.put("/request-shift/:id", RequestShiftController.updateRequestShift);
router.delete("/request-shift/:id", RequestShiftController.deleteRequestShift);
router.patch(
  "/request-shift/:id/approve",
  RequestShiftController.approveRequestShift
);
router.patch(
  "/request-shift/:id/reject",
  RequestShiftController.rejectRequestShift
);

// Mobile group
router.get("/mobile/request-shift", RequestShiftController.getAllRequestShifts);
router.get(
  "/mobile/request-shift/user",
  RequestShiftController.getRequestShiftsByUserId
);
router.get(
  "/mobile/request-shift/:id",
  RequestShiftController.getRequestShiftById
);
router.post("/mobile/request-shift", RequestShiftController.createRequestShift);
router.put(
  "/mobile/request-shift/:id",
  RequestShiftController.updateRequestShift
);
router.delete(
  "/mobile/request-shift/:id",
  RequestShiftController.deleteRequestShift
);

// Partner group
router.get(
  "/partner/request-shift",
  RequestShiftController.getAllRequestShifts
);
router.get(
  "/partner/request-shift/facility",
  RequestShiftController.getRequestShiftsByFacility
);
router.get(
  "/partner/request-shift/:id",
  RequestShiftController.getRequestShiftById
);
router.post(
  "/partner/request-shift",
  RequestShiftController.createRequestShift
);
router.put(
  "/partner/request-shift/:id",
  RequestShiftController.updateRequestShift
);
router.delete(
  "/partner/request-shift/:id",
  RequestShiftController.deleteRequestShift
);
router.patch(
  "/partner/request-shift/:id/approve",
  RequestShiftController.approveRequestShift
);
router.patch(
  "/partner/request-shift/:id/reject",
  RequestShiftController.rejectRequestShift
);

// Backoffice group
router.get(
  "/backoffice/request-shift",
  RequestShiftController.getAllRequestShifts
);
router.get(
  "/backoffice/request-shift/:id",
  RequestShiftController.getRequestShiftById
);
router.post(
  "/backoffice/request-shift",
  RequestShiftController.createRequestShift
);
router.put(
  "/backoffice/request-shift/:id",
  RequestShiftController.updateRequestShift
);
router.delete(
  "/backoffice/request-shift/:id",
  RequestShiftController.deleteRequestShift
);
router.patch(
  "/backoffice/request-shift/:id/approve",
  RequestShiftController.approveRequestShift
);
router.patch(
  "/backoffice/request-shift/:id/reject",
  RequestShiftController.rejectRequestShift
);

export default router;
