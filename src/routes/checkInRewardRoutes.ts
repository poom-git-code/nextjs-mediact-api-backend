import Router from "koa-router";
import { languageMiddleware } from "../middleware/languageMiddleware";
import {
  listRewards,
  listAllRewards,
  redeemRewardById,
  listUserRedemptions,
  getUserRewardsOverviewController,
  listAllRedemptions,
  getRedemptionById,
  completeRedemptionById,
  createRewardController,
  updateRewardController,
  deleteRewardController,
  rejectRefundById,
  getRewardById,
  importRewardsController,
  listDistinctRewards, // <--- Import controller
} from "../controllers/checkInRewardController";

const router = new Router({ prefix: "/rewards" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// User routes
router.get("/distinct", listDistinctRewards);
router.get("/", listRewards);
router.post("/redeem", redeemRewardById);
router.get("/redemptions", listUserRedemptions);
router.get("/overview", getUserRewardsOverviewController);
router.get("/all", listAllRewards);
router.get("/:id", getRewardById);

router.get("/redemptions/all", listAllRedemptions);
router.get("/redemptions/:id", getRedemptionById);

// admin routes
router.post("/import-excel", importRewardsController);
router.post("/", createRewardController);
router.patch("/:id", updateRewardController);
router.delete("/:id", deleteRewardController);

router.post("/redemptions/:id/complete", completeRedemptionById);
router.post("/redemptions/:id/reject", rejectRefundById);

export default router;
