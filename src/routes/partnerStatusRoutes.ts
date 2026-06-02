import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as PartnerStatusController from '../controllers/partnerStatusController';

const router = new Router({
    prefix: '/partner-status',
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Create new partner status
router.post('/', PartnerStatusController.createPartnerStatus);

// Get all partner statuses
router.get('/', PartnerStatusController.getAllPartnerStatuses);

// Get single partner status by ID
router.get('/:id', PartnerStatusController.getPartnerStatusById);

// Update partner status by ID
router.put('/:id', PartnerStatusController.updatePartnerStatus);

// Delete partner status by ID
router.delete('/:id', PartnerStatusController.deletePartnerStatus);

export default router;
