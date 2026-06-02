import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ShiftTypeController from '../controllers/shiftTypeController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/shift-types', ShiftTypeController.createShiftType);
router.put('/shift-types/:id', ShiftTypeController.updateShiftType);
router.delete('/shift-types/:id', ShiftTypeController.deleteShiftType);
router.get('/shift-types', ShiftTypeController.getAllShiftTypes);
router.get('/shift-types/facility', ShiftTypeController.getShiftTypeByFacility);
router.get('/shift-types/:id/relations', ShiftTypeController.getShiftTypeWithRelations);
router.get('/shift-types/:id', ShiftTypeController.getShiftTypeById);

// --- Mobile ---
router.get('/mobile/shift-types', ShiftTypeController.getShiftTypesByDepartmentAndShiftDate);

// --- Backoffice ---
router.get('/backoffice/shift-types', ShiftTypeController.getShiftTypesByDepartmentAndShiftDate);

export default router;