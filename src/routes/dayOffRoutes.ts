import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as DayOffController from "../controllers/dayOffController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Default group
router.get("/day-off", DayOffController.getAllDayOffs);
router.get("/day-off/:id", DayOffController.getDayOffById);
router.post("/day-off", DayOffController.createDayOff);
router.put("/day-off/:id", DayOffController.updateDayOff);
router.delete("/day-off/:id", DayOffController.deleteDayOff);
router.patch("/day-off/:id/approve", DayOffController.approveDayOff);
router.patch("/day-off/:id/reject", DayOffController.rejectDayOff);

// Mobile group
router.get("/mobile/day-off", DayOffController.getAllDayOffs);
router.get("/mobile/day-off/user", DayOffController.getDayOffsByUserId);
router.get("/mobile/day-off/:id", DayOffController.getDayOffById);
router.post("/mobile/day-off", DayOffController.createDayOff);
router.put("/mobile/day-off/:id", DayOffController.updateDayOff);
router.delete("/mobile/day-off/:id", DayOffController.deleteDayOff);
router.patch("/mobile/day-off/:id/approve", DayOffController.approveDayOff);
router.patch("/mobile/day-off/:id/reject", DayOffController.rejectDayOff);

// Partner group
router.get("/partner/day-off", DayOffController.getAllDayOffs);
router.get(
  "/partner/day-off/facility",
  DayOffController.getAllDayOffsByFacility
);
router.get("/partner/day-off/:id", DayOffController.getDayOffById);
router.post("/partner/day-off", DayOffController.createDayOff);
router.put("/partner/day-off/:id", DayOffController.updateDayOff);
router.delete("/partner/day-off/:id", DayOffController.deleteDayOff);
router.patch("/partner/day-off/:id/approve", DayOffController.approveDayOff);
router.patch("/partner/day-off/:id/reject", DayOffController.rejectDayOff);

// Backoffice group
router.get("/backoffice/day-off", DayOffController.getAllDayOffs);
router.get("/backoffice/day-off/:id", DayOffController.getDayOffById);
router.post("/backoffice/day-off", DayOffController.createDayOff);
router.put("/backoffice/day-off/:id", DayOffController.updateDayOff);
router.delete("/backoffice/day-off/:id", DayOffController.deleteDayOff);
router.patch("/backoffice/day-off/:id/approve", DayOffController.approveDayOff);
router.patch("/backoffice/day-off/:id/reject", DayOffController.rejectDayOff);

export default router;
