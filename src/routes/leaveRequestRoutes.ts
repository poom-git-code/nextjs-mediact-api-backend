import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as LeaveRequestController from "../controllers/leaveRequestController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Default group
router.get("/leave-request", LeaveRequestController.getAllLeaveRequests);
router.get(
  "/leave-request/user",
  LeaveRequestController.getLeaveRequestsByUserId
);
router.get(
  "/leave-request/summary",
  LeaveRequestController.getLeaveSummaryByUserId
);
router.get("/leave-request/:id", LeaveRequestController.getLeaveRequestById);
router.post("/leave-request", LeaveRequestController.createLeaveRequest);
router.put("/leave-request/:id", LeaveRequestController.updateLeaveRequest);
router.delete("/leave-request/:id", LeaveRequestController.deleteLeaveRequest);
router.patch("/leave-request/:id/approve", LeaveRequestController.approveLeaveRequest);
router.patch("/leave-request/:id/reject", LeaveRequestController.rejectLeaveRequest);

// Mobile group
router.get("/mobile/leave-request", LeaveRequestController.getAllLeaveRequests);
router.get(
  "/mobile/leave-request/user",
  LeaveRequestController.getLeaveRequestsByUserId
);
router.get(
  "/mobile/leave-request/summary",
  LeaveRequestController.getLeaveSummaryByUserId
);
router.get(
  "/mobile/leave-request/:id",
  LeaveRequestController.getLeaveRequestById
);

router.post("/mobile/leave-request", LeaveRequestController.createLeaveRequest);
router.put(
  "/mobile/leave-request/:id",
  LeaveRequestController.updateLeaveRequest
);
router.delete(
  "/mobile/leave-request/:id",
  LeaveRequestController.deleteLeaveRequest
);
router.patch("/mobile/leave-request/:id/approve", LeaveRequestController.approveLeaveRequest);
router.patch("/mobile/leave-request/:id/reject", LeaveRequestController.rejectLeaveRequest);

// Partner group
router.get(
  "/partner/leave-request",
  LeaveRequestController.getAllLeaveRequests
);
router.get(
  "/partner/leave-request/user",
  LeaveRequestController.getLeaveRequestsByUserId
);
router.get(
  "/partner/leave-request/facility",
  LeaveRequestController.getLeaveRequestsByFacility
);
router.get(
  "/partner/leave-request/summary",
  LeaveRequestController.getLeaveSummaryByUserId
);
router.get(
  "/partner/leave-request/:id",
  LeaveRequestController.getLeaveRequestById
);
router.post(
  "/partner/leave-request",
  LeaveRequestController.createLeaveRequest
);
router.put(
  "/partner/leave-request/:id",
  LeaveRequestController.updateLeaveRequest
);
router.delete(
  "/partner/leave-request/:id",
  LeaveRequestController.deleteLeaveRequest
);
router.patch("/partner/leave-request/:id/approve", LeaveRequestController.approveLeaveRequest);
router.patch("/partner/leave-request/:id/reject", LeaveRequestController.rejectLeaveRequest);

// Backoffice group
router.get(
  "/backoffice/leave-request",
  LeaveRequestController.getAllLeaveRequests
);
router.get(
  "/backoffice/leave-request/user",
  LeaveRequestController.getLeaveRequestsByUserId
);
router.get(
  "/backoffice/leave-request/summary",
  LeaveRequestController.getLeaveSummaryByUserId
);
router.get(
  "/backoffice/leave-request/:id",
  LeaveRequestController.getLeaveRequestById
);
router.post(
  "/backoffice/leave-request",
  LeaveRequestController.createLeaveRequest
);
router.put(
  "/backoffice/leave-request/:id",
  LeaveRequestController.updateLeaveRequest
);
router.delete(
  "/backoffice/leave-request/:id",
  LeaveRequestController.deleteLeaveRequest
);
router.patch("/backoffice/leave-request/:id/approve", LeaveRequestController.approveLeaveRequest);
router.patch("/backoffice/leave-request/:id/reject", LeaveRequestController.rejectLeaveRequest);

export default router;
