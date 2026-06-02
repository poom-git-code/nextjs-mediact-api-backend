import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware'; // import middleware ที่ใช้ร่วมกัน
import * as CreditTypeController from '../controllers/eventCreditTypeController';

const router = new Router({ prefix: '/event-credit-types' });

router.use(languageMiddleware);

router.get('/', CreditTypeController.getAllCreditTypes);

export default router;