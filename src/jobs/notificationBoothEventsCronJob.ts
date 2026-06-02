import cron from "node-cron";
import { expireOldNotifications } from "../services/notificationBoothEventsService";

cron.schedule("0 */12 * * *", async () => {
    console.log("Checking for expired notifications...");
    await expireOldNotifications();
});
