import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
  getBonusDays,
  addBonusDay,
  editBonusDay,
  removeBonusDay,
} from "../controllers/bonusDaysController";

const router = new Router({ prefix: "/bonus-days" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", getBonusDays);
router.post("/", addBonusDay);
router.patch("/:id", editBonusDay);
router.delete("/:id", removeBonusDay);

export default router;
