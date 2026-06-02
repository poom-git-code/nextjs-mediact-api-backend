import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as Controller from "../controllers/userEventStampsController";

const router = new Router({ prefix: "/user-event-stamps" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// router.post("/scan", Controller.scanStampFromUrl);
router.post("/:stamp_code", Controller.addStamp);
// router.get("/", Controller.getStamps);
router.get("/", Controller.getUserStampsByUserId);
router.delete("/:id", Controller.deleteUserStampByUserId);
router.get("/management", Controller.getUserStampsManagement);

export default router;
