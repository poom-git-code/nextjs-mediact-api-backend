import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as ShiftStatusController from '../controllers/shiftStatusController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// CRUD operations
router.post('/shift-statuses', ShiftStatusController.createShiftStatus);
router.put('/shift-statuses/:id', ShiftStatusController.updateShiftStatus);
router.delete('/shift-statuses/:id', ShiftStatusController.deleteShiftStatus);
router.get('/shift-statuses', ShiftStatusController.getAllShiftStatuses);
router.get('/shift-statuses/:id', ShiftStatusController.getShiftStatusById);

// Additional endpoints
router.get('/shift-statuses/active', ShiftStatusController.getActiveShiftStatuses);
router.get('/shift-statuses/name/:name', ShiftStatusController.getShiftStatusByName);

export default router;
