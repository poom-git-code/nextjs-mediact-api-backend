import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as BoothEventController from "../controllers/boothEventController";

const router = new Router({ prefix: "/booth-events" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/", BoothEventController.createBoothEvent);
router.get("/management", BoothEventController.getAllBoothEventsManagement);
router.get("/:id", BoothEventController.getBoothEventById);
router.put("/:id", BoothEventController.updateBoothEvent);
router.delete("/:id", BoothEventController.deleteBoothEvent);

export default router;
