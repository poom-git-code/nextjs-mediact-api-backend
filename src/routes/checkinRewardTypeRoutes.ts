import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
  listRewardTypes,
  getRewardType,
  createRewardTypeController,
  updateRewardTypeController,
  deleteRewardTypeController,
} from "../controllers/checkinRewardTypeController";

const router = new Router({ prefix: "/reward-types" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get("/", listRewardTypes);
router.get("/:id", getRewardType);
router.post("/:id", createRewardTypeController);
router.patch("/:id", updateRewardTypeController);
router.delete("/:id", deleteRewardTypeController);

export default router;
