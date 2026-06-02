import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as SwapRequestController from "../controllers/swapRequestController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Default group
router.get("/swap-request", SwapRequestController.getAllSwapRequests);
router.get(
  "/swap-request/department/:departmentId/month/:month/year/:year",
  SwapRequestController.getSwapRequestsByDepartmentMonthYear
);
router.get("/swap-request/:id", SwapRequestController.getSwapRequestById);
router.post("/swap-request", SwapRequestController.createSwapRequest);
router.put("/swap-request/:id", SwapRequestController.updateSwapRequest);
router.delete("/swap-request/:id", SwapRequestController.deleteSwapRequest);
// router.get(
//   "/swap-request/by-userId",
//   SwapRequestController.getSwapRequestsByUserId
// );

// Mobile group
router.get(
  "/mobile/swap-request/by-userId",
  SwapRequestController.getSwapRequestsByUserId
);
router.get(
  "/mobile/swap-request/from-friend",
  SwapRequestController.getSwapRequestsFromFriend
);
router.get(
  "/mobile/swap-request/for-supervisor",
  SwapRequestController.getSwapRequestsForSupervisor
);
router.get("/mobile/swap-request", SwapRequestController.getAllSwapRequests);
router.get(
  "/mobile/swap-request/department/:departmentId/month/:month/year/:year",
  SwapRequestController.getSwapRequestsByDepartmentMonthYear
);
router.get(
  "/mobile/swap-request/v2/:id",
  SwapRequestController.getSwapRequestByIdMobile
);
router.get(
  "/mobile/swap-request/:id",
  SwapRequestController.getSwapRequestById
);
router.post("/mobile/swap-request", SwapRequestController.createSwapRequest);
router.put("/mobile/swap-request/:id", SwapRequestController.updateSwapRequest);
router.delete(
  "/mobile/swap-request/:id",
  SwapRequestController.deleteSwapRequest
);
router.put(
  "/mobile/swap-request/approve/:swapShiftId",
  SwapRequestController.approveSwapRequest
);
router.put(
  "/mobile/swap-request/reject/:swapShiftId",
  SwapRequestController.rejectSwapRequest
);
router.put(
  "/mobile/swap-request/approve-supervisor/:swapRequestId",
  SwapRequestController.approveSwapRequestSupervisor
);
router.put(
  "/mobile/swap-request/reject-supervisor/:swapRequestId",
  SwapRequestController.rejectSwapRequestSupervisor
);

// Partner group
router.get("/partner/swap-request", SwapRequestController.getAllSwapRequests);
router.get(
  "/partner/swap-request/department/:departmentId/month/:month/year/:year",
  SwapRequestController.getSwapRequestsByDepartmentMonthYear
);
router.get(
  "/partner/swap-request/:id",
  SwapRequestController.getSwapRequestById
);
router.post("/partner/swap-request", SwapRequestController.createSwapRequest);
router.put(
  "/partner/swap-request/:id",
  SwapRequestController.updateSwapRequest
);
router.delete(
  "/partner/swap-request/:id",
  SwapRequestController.deleteSwapRequest
);
// router.get(
//   "/partner/swap-request/by-userId",
//   SwapRequestController.getSwapRequestsByUserId
// );

// Backoffice group
router.get(
  "/backoffice/swap-request",
  SwapRequestController.getAllSwapRequests
);
router.get(
  "/backoffice/swap-request/department/:departmentId/month/:month/year/:year",
  SwapRequestController.getSwapRequestsByDepartmentMonthYear
);
router.get(
  "/backoffice/swap-request/:id",
  SwapRequestController.getSwapRequestById
);
router.post(
  "/backoffice/swap-request",
  SwapRequestController.createSwapRequest
);
router.put(
  "/backoffice/swap-request/:id",
  SwapRequestController.updateSwapRequest
);
router.delete(
  "/backoffice/swap-request/:id",
  SwapRequestController.deleteSwapRequest
);
// router.get(
//   "/backoffice/swap-request/by-userId",
//   SwapRequestController.getSwapRequestsByUserId
// );
router.put(
  "/backoffice/swap-request/approve/:swapRequestId",
  SwapRequestController.approveSwapRequestSupervisor
);
router.put(
  "/backoffice/swap-request/reject/:swapRequestId",
  SwapRequestController.rejectSwapRequestSupervisor
);

export default router;
