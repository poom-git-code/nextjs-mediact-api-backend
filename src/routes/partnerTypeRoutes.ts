import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as PartnerTypeController from "../controllers/partnerTypeController";

const router = new Router({ prefix: "/partner-type" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", PartnerTypeController.getAllPartnerTypes);
router.get("/:id", PartnerTypeController.getPartnerTypeById);
router.post("/", PartnerTypeController.createPartnerType);
router.put("/:id", PartnerTypeController.updatePartnerType);
router.delete("/:id", PartnerTypeController.deletePartnerType);

export default router;