import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as LeaveLimitsController from "../controllers/leaveLimitsController";

const router = new Router({ prefix: "/leave-limits" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Default group
router.get("/", LeaveLimitsController.getAllLeaveLimits);
router.get("/:id", LeaveLimitsController.getLeaveLimitById);
router.post("/", LeaveLimitsController.createLeaveLimit);
router.put("/:id", LeaveLimitsController.updateLeaveLimit);
router.delete("/:id", LeaveLimitsController.deleteLeaveLimit);

// Get leave limits by facility
router.get(
  "/facility/:facilityId",
  LeaveLimitsController.getLeaveLimitsByFacility
);

// Get leave limits by leave type
router.get(
  "/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitsByLeaveType
);

// Get specific leave limit by facility and leave type
router.get(
  "/facility/:facilityId/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitByFacilityAndType
);

// Mobile group
router.get("/mobile", LeaveLimitsController.getAllLeaveLimits);
router.get("/mobile/:id", LeaveLimitsController.getLeaveLimitById);
router.post("/mobile", LeaveLimitsController.createLeaveLimit);
router.put("/mobile/:id", LeaveLimitsController.updateLeaveLimit);
router.delete("/mobile/:id", LeaveLimitsController.deleteLeaveLimit);

// Mobile specific routes
router.get(
  "/mobile/facility/:facilityId",
  LeaveLimitsController.getLeaveLimitsByFacility
);
router.get(
  "/mobile/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitsByLeaveType
);
router.get(
  "/mobile/facility/:facilityId/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitByFacilityAndType
);

// Partner group
router.get("/partner", LeaveLimitsController.getAllLeaveLimits);
router.get("/partner/:id", LeaveLimitsController.getLeaveLimitById);
router.post("/partner", LeaveLimitsController.createLeaveLimit);
router.put("/partner/:id", LeaveLimitsController.updateLeaveLimit);
router.delete("/partner/:id", LeaveLimitsController.deleteLeaveLimit);

// Partner specific routes
router.get(
  "/partner/facility/:facilityId",
  LeaveLimitsController.getLeaveLimitsByFacility
);
router.get(
  "/partner/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitsByLeaveType
);
router.get(
  "/partner/facility/:facilityId/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitByFacilityAndType
);

// Backoffice group
router.get("/backoffice", LeaveLimitsController.getAllLeaveLimits);
router.get("/backoffice/:id", LeaveLimitsController.getLeaveLimitById);
router.post("/backoffice", LeaveLimitsController.createLeaveLimit);
router.put("/backoffice/:id", LeaveLimitsController.updateLeaveLimit);
router.delete("/backoffice/:id", LeaveLimitsController.deleteLeaveLimit);

// Backoffice specific routes
router.get(
  "/backoffice/facility/:facilityId",
  LeaveLimitsController.getLeaveLimitsByFacility
);
router.get(
  "/backoffice/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitsByLeaveType
);
router.get(
  "/backoffice/facility/:facilityId/leave-type/:leaveTypeId",
  LeaveLimitsController.getLeaveLimitByFacilityAndType
);

export default router;
