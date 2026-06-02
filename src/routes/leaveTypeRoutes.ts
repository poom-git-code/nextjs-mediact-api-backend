import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as LeaveTypeController from "../controllers/leaveTypeController";

const router = new Router({ prefix: "/leave-types" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", LeaveTypeController.getAllLeaveTypes);
router.get("/:id", LeaveTypeController.getLeaveTypeById);
router.post("/", LeaveTypeController.createLeaveType);
router.put("/:id", LeaveTypeController.updateLeaveType);
router.delete("/:id", LeaveTypeController.deleteLeaveType);

export default router;