import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as MasterCountryController from '../controllers/masterCountryController';

const router = new Router({ prefix: '/masterCountry' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', MasterCountryController.getAllCountries);
router.get('/:id', MasterCountryController.getCountryById);
router.post('/', MasterCountryController.createCountry);
router.put('/:id', MasterCountryController.updateCountry);
router.delete('/:id', MasterCountryController.deleteCountry);

export default router;
