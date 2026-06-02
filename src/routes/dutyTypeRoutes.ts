import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as DutyTypeController from '../controllers/dutyTypeController';
import { authenticate } from '../middlewares/auth.middleware';

const router = new Router({ prefix: '/duty-types' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Apply authentication middleware to all routes
router.use(authenticate);

// CRUD Routes
router.post('/', DutyTypeController.createDutyType);
router.put('/:id', DutyTypeController.updateDutyType);
router.delete('/:id', DutyTypeController.deleteDutyType);
router.get('/:id', DutyTypeController.getDutyTypeById);
router.get('/', DutyTypeController.getAllDutyTypes);

// Additional Routes
router.get('/active/list', DutyTypeController.getActiveDutyTypes);
router.get('/code/:code', DutyTypeController.getDutyTypeByCode);
router.put('/bulk/update', DutyTypeController.bulkUpdateDutyTypes);
router.post('/validate/exists', DutyTypeController.validateDutyTypeExists);

export default router;
