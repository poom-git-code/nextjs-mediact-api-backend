import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as LuckyColorController from "../controllers/luckyColorController";

const router = new Router({ prefix: "/colors" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Mobile
router.get("/mobile/today", LuckyColorController.getTodayColors);
router.get("/mobile/monthly", LuckyColorController.getMonthlyColors);
router.get("/mobile/yearly", LuckyColorController.getYearlyColors);

// Backoffice
// router.get("/admin", LuckyColorController.getAllColors);
// router.get("/admin/grouped", LuckyColorController.getColorsByGroup);
// router.get("/admin/:id", LuckyColorController.getColorById);
// router.post("/admin", LuckyColorController.createColor);
// router.put("/admin/:id", LuckyColorController.updateColor);
// router.delete("/admin/:id", LuckyColorController.deleteColor);

export default router;
