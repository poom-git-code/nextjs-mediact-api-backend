import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as MedicalStaffController from "../controllers/medicalStaffController";

const router = new Router({ prefix: "/medical-staff" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get(
  "/mobile/get-user-details-by-role/:id",
  MedicalStaffController.getUserDetailsWithSchedulesByRole
);

router.post(
  "/mobile/get-users-for-swap",
  MedicalStaffController.getUserForSwapController
);

router.post(
  "/mobile/get-users-for-transfer",
  MedicalStaffController.getUserForTransferController
);

export default router;
