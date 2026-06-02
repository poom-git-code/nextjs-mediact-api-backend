import cron from 'node-cron';
import { runDataSyncJob } from '../services/creditLogsService';
import { expiredOldAds } from '../services/adsService';

const TIMEZONE = "Asia/Bangkok";

// --- ตรวจสอบโฆษณาหมดอายุ (ทุก 12 ชั่วโมง) ---
cron.schedule('0 */12 * * *', async () => {
    console.log('[CRON] Checking for expired ads...');
    try {
        await expiredOldAds();
        console.log('[CRON] Expired ads job finished.');
    } catch (error) {
        console.error('[CRON] Error running expiredOldAds job:', error);
    }
}, {
    timezone: TIMEZONE
});

// --- กระทบยอดข้อมูล (ทุกคืนตอนตี 3) ---
cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Running data sync job (Re-Sync)...');
    try {
        const result = await runDataSyncJob();
        console.log('[CRON] Data sync job finished successfully:', result);
    } catch (error) {
        console.error('[CRON] Error running data sync job:', error);
    }
}, {
    timezone: TIMEZONE
});

console.log('Cron jobs scheduled.');