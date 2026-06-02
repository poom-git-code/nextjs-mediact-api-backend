import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as PartnerReferenceFileController from '../controllers/partnerReferenceFileController';

const router = new Router({
    prefix: '/partner-reference-files',
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// 🛡️ Protected routes using authMiddleware
router.post('/', PartnerReferenceFileController.createPartnerReferenceFile);
router.get('/', PartnerReferenceFileController.getAllPartnerReferenceFiles);
router.get('/:id', PartnerReferenceFileController.getPartnerReferenceFileById);
router.get('/partner/:id', PartnerReferenceFileController.getPartnerReferenceFileByPartnerId);
router.put('/:id', PartnerReferenceFileController.updatePartnerReferenceFile);
router.delete('/:id', PartnerReferenceFileController.deletePartnerReferenceFile);

export default router;
