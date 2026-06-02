import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as FacilityTypeController from '../controllers/facilityTypeController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/facility-types', FacilityTypeController.createFacilityType);
router.put('/facility-types/:id', FacilityTypeController.updateFacilityType);
router.delete('/facility-types/:id', FacilityTypeController.deleteFacilityType);
router.get('/facility-types/:id', FacilityTypeController.getFacilityTypeById);
router.get('/facility-types', FacilityTypeController.getAllFacilityTypes);

export default router;