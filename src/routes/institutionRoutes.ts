import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as InstitutionController from "../controllers/institutionController";

const router = new Router({ prefix: "/institutions" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", InstitutionController.getAllInstitutions);
router.get("/:id", InstitutionController.getInstitutionById);
router.post("/", InstitutionController.createInstitution);
router.put("/:id", InstitutionController.updateInstitution);
router.delete("/:id", InstitutionController.deleteInstitution);

export default router;