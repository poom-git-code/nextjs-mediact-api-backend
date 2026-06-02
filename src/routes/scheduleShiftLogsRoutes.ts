import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ScheduleShiftLogsController from "../controllers/scheduleShiftLogsController";


const router = new Router({ prefix: "/schedule-shift-logs" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Mobile
router.post("/mobile", ScheduleShiftLogsController.createScheduleShiftLog);
router.get("/mobile", ScheduleShiftLogsController.getAllScheduleShiftLogs);
router.get("/mobile/:id", ScheduleShiftLogsController.getScheduleShiftLogById);
router.put("/mobile/:id", ScheduleShiftLogsController.updateScheduleShiftLog);
router.delete("/mobile/:id", ScheduleShiftLogsController.deleteScheduleShiftLog);

router.get("/mobile/user", ScheduleShiftLogsController.getLogsByUserId);

// not test yet
// Special endpoints
router.get("/schedule-shift/:schedule_shift_id", ScheduleShiftLogsController.getLogsByScheduleShiftId);
router.get("/schedule-shift/:schedule_shift_id/latest", ScheduleShiftLogsController.getLatestLogByScheduleShiftId);
router.post("/bulk", ScheduleShiftLogsController.bulkCreateScheduleShiftLogs);

export default router;
