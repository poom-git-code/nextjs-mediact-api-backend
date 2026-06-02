import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
  createCredits,
  checkRemainingCredits,
  // deductCredits,
  getAllCredits,
  getCreditById,
  getRemainingCreditByPartnerId,
  updateAdBudget,
} from '../controllers/creditController';

const router = new Router({ prefix: "/credits" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.put("/ad/update-budget", updateAdBudget)

router.get("/remaining/:partner_id/for-budget", getRemainingCreditByPartnerId)

// สร้างเครดิตใหม่
router.post('/', createCredits);

// ตรวจสอบเครดิตที่เหลือ
router.get('/remaining/:user_id', checkRemainingCredits);

// หักเครดิต
// router.post('/deduct', deductCredits);

router.get('/', getAllCredits);

router.get('/:id', getCreditById)

export default router;
