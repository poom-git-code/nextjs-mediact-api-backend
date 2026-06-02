import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ScheduleShiftLogTypesController from "../controllers/scheduleShiftLogTypesController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Base route: /api/schedule-shift-log-types

// CRUD operations
router.post("/", ScheduleShiftLogTypesController.createScheduleShiftLogType);
router.get("/", ScheduleShiftLogTypesController.getAllScheduleShiftLogTypes);
router.get("/:id", ScheduleShiftLogTypesController.getScheduleShiftLogTypeById);
router.put("/:id", ScheduleShiftLogTypesController.updateScheduleShiftLogType);
router.delete("/:id", ScheduleShiftLogTypesController.deleteScheduleShiftLogType);

// Special endpoints
router.get("/name/:name", ScheduleShiftLogTypesController.getScheduleShiftLogTypeByName);
router.post("/initialize-defaults", ScheduleShiftLogTypesController.initializeDefaultLogTypes);

export default router;
