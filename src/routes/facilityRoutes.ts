import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as FacilityController from '../controllers/facilityController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/facilities', FacilityController.createFacility);
router.put('/facilities/:id', FacilityController.updateFacility);
router.delete('/facilities/:id', FacilityController.deleteFacility);
router.get('/facilities/:id', FacilityController.getFacilityById);
router.get('/facilities', FacilityController.getAllFacilities);

export default router;