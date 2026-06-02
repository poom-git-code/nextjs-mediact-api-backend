import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as GenderController from "../controllers/genderController";

const router = new Router({ prefix: "/gender" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", GenderController.getAllGenders);
router.get("/:id", GenderController.getGenderById);
router.post("/", GenderController.createGender);
router.put("/:id", GenderController.updateGender);
router.delete("/:id", GenderController.deleteGender);

export default router;