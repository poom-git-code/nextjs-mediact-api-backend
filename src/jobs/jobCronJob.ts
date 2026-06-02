import cron from "node-cron";
import { autoCloseJobsByTime } from "../services/jobService";

cron.schedule("0 */12 * * *", async () => {
    console.log("Checking for expired jobs...");
    await autoCloseJobsByTime();
});
