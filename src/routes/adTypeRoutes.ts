import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as AdTypeController from "../controllers/adTypeController";

const router = new Router({ prefix: "/ad-type" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", AdTypeController.getAllAdsTypes);
router.get("/:id", AdTypeController.getAdTypeById);
router.post("/", AdTypeController.createAdType);
router.put("/:id", AdTypeController.updateAdType);
router.delete("/:id", AdTypeController.deleteAdType);

export default router;