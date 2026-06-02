import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as BoothEventListController from "../controllers/boothEventListController";

const router = new Router({ prefix: "/booth-event-list" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/", BoothEventListController.createBoothEventList);
router.get(
  "/management",
  BoothEventListController.getAllBoothEventListsManagement
);
router.get("/", BoothEventListController.getAllBoothEventLists);
router.get("/:id", BoothEventListController.getBoothListByEventId);
router.get("/active", BoothEventListController.getBoothListbyIsActive);
router.put("/:id", BoothEventListController.updateBoothEventList);
router.delete("/:id", BoothEventListController.deleteBoothEventList);

export default router;
