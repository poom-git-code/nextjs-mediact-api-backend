import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as CreditRequestController from '../controllers/creditRequestController';

const router = new Router({ prefix: '/credit-requests' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/', CreditRequestController.createCreditRequest);
router.put('/:id/approve', CreditRequestController.approveCreditRequest);
router.put('/:id/reject', CreditRequestController.rejectCreditRequest);
router.get('/', CreditRequestController.getAllCreditRequests);

export default router;
