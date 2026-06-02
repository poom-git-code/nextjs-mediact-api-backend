import cron from "node-cron";
import { expiredOldEvents } from "../services/eventService";

cron.schedule("0 */12 * * *", async () => {
    console.log("Checking for expired events...");
    await expiredOldEvents();
});
