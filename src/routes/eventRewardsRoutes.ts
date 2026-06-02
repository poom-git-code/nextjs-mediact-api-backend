import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as Controller from "../controllers/eventRewardsController";

const router = new Router({ prefix: "/event-rewards" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/", Controller.createReward);
router.get("/active", Controller.getUserActiveReward);
router.get("/", Controller.getUserRewards);
router.delete("/:id", Controller.deleteRewardByBooth);

export default router;
