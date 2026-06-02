import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as FacilityAdminController from '../controllers/facilityAdminController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Basic CRUD operations
router.post('/facility-admins', FacilityAdminController.createFacilityAdmin);
router.put('/facility-admins/:id', FacilityAdminController.updateFacilityAdmin);
router.delete('/facility-admins/:id', FacilityAdminController.deleteFacilityAdmin);
router.get('/facility-admins/:id', FacilityAdminController.getFacilityAdminById);
router.get('/facility-admins', FacilityAdminController.getAllFacilityAdmins);

// Additional specialized endpoints
router.get('/facility-admins/facility/:facility_id', FacilityAdminController.getFacilityAdminsByFacility);
router.get('/facility-admins/user/:user_id', FacilityAdminController.getFacilityAdminsByUser);
router.get('/facility-admins/active/list', FacilityAdminController.getActiveFacilityAdmins);

// Partner Basic CRUD operations
router.post('/partner/facility-admins', FacilityAdminController.createFacilityAdmin);
router.put('/partner/facility-admins/:id', FacilityAdminController.updateFacilityAdmin);
router.delete('/partner/facility-admins/:id', FacilityAdminController.deleteFacilityAdmin);
router.get('/partner/facility-admins/:id', FacilityAdminController.getFacilityAdminById);
router.get('/partner/facility-admins', FacilityAdminController.getAllFacilityAdmins);

// Partner Additional specialized endpoints
router.get('/partner/facility-admins/facility/:facility_id', FacilityAdminController.getFacilityAdminsByFacility);
router.get('/partner/facility-admins/user/:user_id', FacilityAdminController.getFacilityAdminsByUser);
router.get('/partner/facility-admins/active/list', FacilityAdminController.getActiveFacilityAdmins);


export default router;
