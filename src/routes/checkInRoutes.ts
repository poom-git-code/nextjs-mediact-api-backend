import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
  checkInStatus,
  checkInToday,
  checkInHistory,
  checkInStats,
  checkInCalendar,
  manualCheckIn,
  getAllLogs,
  getUserLogsById,
  getUserPoints,
  deleteCheckIn,
  updateCheckIn,
} from "../controllers/checkInController";

const router = new Router({ prefix: "/checkin" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// USER ROUTES
router.get("/status", checkInStatus);
router.post("/", checkInToday);
router.get("/history", checkInHistory);
router.get("/stats", checkInStats);
router.get("/calendar", checkInCalendar);
router.get("/user/points", getUserPoints);

// ADMIN ROUTES
router.post("/manual", manualCheckIn);
router.get("/logs", getAllLogs);
router.get("/logs/user/:id", getUserLogsById);
router.put("/:id", updateCheckIn);
router.delete("/:id", deleteCheckIn);

export default router;
