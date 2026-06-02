import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as educationInstitutionsController from '../controllers/educationInstitutionsController';

const router = new Router({ prefix: "/education-institutions" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', educationInstitutionsController.getAllEducationInstitutions);
router.get('/:id', educationInstitutionsController.getEducationInstitutionById);
router.post('/', educationInstitutionsController.createEducationInstitution);
router.put('/:id', educationInstitutionsController.updateEducationInstitution);
router.delete('/:id', educationInstitutionsController.deleteEducationInstitution);

export default router;
