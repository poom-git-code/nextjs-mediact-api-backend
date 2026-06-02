import cron from "node-cron";
import { deactivateExpiredRewards } from "../services/checkInRewardService";

/**
 * Cron job สำหรับปิดสถานะ is_active ของรางวัลที่หมดอายุ
 * รันทุกวันเวลา 00:01 น.
 */
cron.schedule("1 0 * * *", async () => {
  console.log("Checking for expired rewards...");
  try {
    await deactivateExpiredRewards();
  } catch (error) {
    console.error("Error in reward expiry cron job:", error);
  }
});