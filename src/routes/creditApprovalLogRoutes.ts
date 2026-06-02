import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as creditApprovalLogController from '../controllers/creditApprovalLogController'

const router = new Router({
    prefix: '/credit-approval-logs',
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', creditApprovalLogController.getAllApprovalLogs);
router.get('/:credit_log_id', creditApprovalLogController.getApprovalLogsByCreditLogId);
router.post('/', creditApprovalLogController.createApprovalLog);

export default router;