import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware";
import * as GiveShiftRequestController from "../controllers/giveShiftRequestController";

const router = new Router();

router.use(languageMiddleware);

// --- Default Group ---
router.get(
  "/give-shift-request",
  GiveShiftRequestController.getAllGiveShiftRequests
);
router.get(
  "/give-shift-request/department/:departmentId/month/:month/year/:year",
  GiveShiftRequestController.getGiveShiftRequestsByDepartmentMonthYear
);
router.get(
  "/give-shift-request/:id",
  GiveShiftRequestController.getGiveShiftRequestById
);
router.post(
  "/give-shift-request",
  GiveShiftRequestController.createGiveShiftRequest
);
router.put(
  "/give-shift-request/:id",
  GiveShiftRequestController.updateGiveShiftRequest
);
router.delete(
  "/give-shift-request/:id",
  GiveShiftRequestController.deleteGiveShiftRequest
);

// --- Mobile Group ---
router.get(
  "/mobile/give-shift-request/for-supervisor",
  GiveShiftRequestController.getGiveShiftRequestsForSupervisor
);
router.get(
  "/mobile/give-shift-request/by-userId",
  GiveShiftRequestController.getGiveShiftRequestsByUserIdMobile
);
router.get(
  "/mobile/give-shift-request/by-targeter",
  GiveShiftRequestController.getGiveShiftRequestsByUserIdTargeterMobile
);
router.get(
  "/mobile/give-shift-request",
  GiveShiftRequestController.getAllGiveShiftRequests
);
router.get(
  "/mobile/give-shift-request/department/:departmentId/month/:month/year/:year",
  GiveShiftRequestController.getGiveShiftRequestsByDepartmentMonthYear
);
router.get(
  "/mobile/give-shift-request/:id",
  GiveShiftRequestController.getGiveShiftRequestById
);
router.post(
  "/mobile/give-shift-request",
  GiveShiftRequestController.createGiveShiftRequest
);
router.put(
  "/mobile/give-shift-request/:id",
  GiveShiftRequestController.updateGiveShiftRequest
);
router.delete(
  "/mobile/give-shift-request/:id",
  GiveShiftRequestController.deleteGiveShiftRequest
);

// Action: เพื่อน (User B) กด
router.put(
  "/mobile/give-shift-request/approve/:requestId",
  GiveShiftRequestController.approveGiveShiftRequest
);
router.put(
  "/mobile/give-shift-request/reject/:requestId",
  GiveShiftRequestController.rejectGiveShiftRequest
);

// Action: หัวหน้า (Supervisor) กด
router.put(
  "/mobile/give-shift-request/approve-supervisor/:requestId",
  GiveShiftRequestController.approveGiveShiftRequestSupervisor
);
router.put(
  "/mobile/give-shift-request/reject-supervisor/:requestId",
  GiveShiftRequestController.rejectGiveShiftRequestSupervisor
);

// --- Partner Group ---
router.get(
  "/partner/give-shift-request/by-userId",
  GiveShiftRequestController.getGiveShiftRequestsByUserId
);
router.get(
  "/partner/give-shift-request",
  GiveShiftRequestController.getAllGiveShiftRequests
);
router.get(
  "/partner/give-shift-request/department/:departmentId/month/:month/year/:year",
  GiveShiftRequestController.getGiveShiftRequestsByDepartmentMonthYear
);
router.get(
  "/partner/give-shift-request/:id",
  GiveShiftRequestController.getGiveShiftRequestById
);
router.post(
  "/partner/give-shift-request",
  GiveShiftRequestController.createGiveShiftRequest
);
router.put(
  "/partner/give-shift-request/:id",
  GiveShiftRequestController.updateGiveShiftRequest
);
router.delete(
  "/partner/give-shift-request/:id",
  GiveShiftRequestController.deleteGiveShiftRequest
);

// Action: เพื่อน (User B) กด
router.put(
  "/partner/give-shift-request/approve/:requestId",
  GiveShiftRequestController.approveGiveShiftRequest
);
router.put(
  "/partner/give-shift-request/reject/:requestId",
  GiveShiftRequestController.rejectGiveShiftRequest
);

// Action: หัวหน้า (Supervisor) กด
router.put(
  "/partner/give-shift-request/approve-supervisor/:requestId",
  GiveShiftRequestController.approveGiveShiftRequestSupervisor
);
router.put(
  "/partner/give-shift-request/reject-supervisor/:requestId",
  GiveShiftRequestController.rejectGiveShiftRequestSupervisor
);
router.get(
  "/partner/give-shift-request/for-supervisor",
  GiveShiftRequestController.getGiveShiftRequestsForSupervisor
);

// --- Backoffice Group ---
router.get(
  "/backoffice/give-shift-request",
  GiveShiftRequestController.getAllGiveShiftRequests
);
router.get(
  "/backoffice/give-shift-request/department/:departmentId/month/:month/year/:year",
  GiveShiftRequestController.getGiveShiftRequestsByDepartmentMonthYear
);
router.get(
  "/backoffice/give-shift-request/:id",
  GiveShiftRequestController.getGiveShiftRequestById
);
router.post(
  "/backoffice/give-shift-request",
  GiveShiftRequestController.createGiveShiftRequest
);
router.put(
  "/backoffice/give-shift-request/:id",
  GiveShiftRequestController.updateGiveShiftRequest
);
router.delete(
  "/backoffice/give-shift-request/:id",
  GiveShiftRequestController.deleteGiveShiftRequest
);

// Action: เพื่อน (User B) กด
router.put(
  "/backoffice/give-shift-request/approve/:requestId",
  GiveShiftRequestController.approveGiveShiftRequest
);
router.put(
  "/backoffice/give-shift-request/reject/:requestId",
  GiveShiftRequestController.rejectGiveShiftRequest
);

// Backoffice/Supervisor Actions
router.put(
  "/backoffice/give-shift-request/approve/:requestId",
  GiveShiftRequestController.approveGiveShiftRequestSupervisor
);
router.put(
  "/backoffice/give-shift-request/reject/:requestId",
  GiveShiftRequestController.rejectGiveShiftRequestSupervisor
);
router.get(
  "/backoffice/give-shift-request/for-supervisor",
  GiveShiftRequestController.getGiveShiftRequestsForSupervisor
);

export default router;
