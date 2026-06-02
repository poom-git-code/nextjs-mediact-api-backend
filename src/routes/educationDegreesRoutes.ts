import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as educationDegreeController from '../controllers/educationDegreesController';

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/education-degrees', educationDegreeController.getAllEducationDegrees);
router.get('/education-degrees/:id', educationDegreeController.getEducationDegreeById);
router.post('/education-degrees', educationDegreeController.createEducationDegree);
router.put('/education-degrees/:id', educationDegreeController.updateEducationDegree);
router.delete('/education-degrees/:id', educationDegreeController.deleteEducationDegree);

export default router;