import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as approverController from '../controllers/approverController';

const router = new Router({ prefix: '/approvers' })

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', approverController.getAllApprovers)
router.get('/by-user/:user_id', approverController.getApproverByUserId)
router.post('/', approverController.createApprover)
router.put('/', approverController.updateApprover)
router.delete('/', approverController.deactiveApprover)
router.post('/from-user', approverController.createApproverFromUser);

export default router