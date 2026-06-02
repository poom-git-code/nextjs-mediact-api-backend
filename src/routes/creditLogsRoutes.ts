import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
    createCreditLog,
    // updateCreditLog,
    getCreditLogById,
    getLogsByCreditId,
    getAllCreditLogs,
    getCreditHistoryByPartnerId,
    getAdReportByPartner,
    sendReportEmail,
} from '../controllers/creditLogsController';

const router = new Router({
    prefix: '/credit-logs',
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// POST /credit-logs - สร้าง credit log
router.post('/', createCreditLog);

// PUT /credit-logs/:id - อัปเดต credit log
// router.put('/:id', updateCreditLog);

// GET /credit-logs/:id - ดึงข้อมูล credit log รายการเดียว
router.get('/:id', getCreditLogById);

// GET /credit-logs/by-credit/:credit_id - ดึง credit logs ทั้งหมดจาก credit_id
router.get('/by-credit/:credit_id', getLogsByCreditId);

router.get('/', getAllCreditLogs);

router.get('/partner/:partner_id/history', getCreditHistoryByPartnerId);

router.get('/partner/:partner_id/ad-report', getAdReportByPartner)

router.post('/send-report', sendReportEmail);


export default router;
