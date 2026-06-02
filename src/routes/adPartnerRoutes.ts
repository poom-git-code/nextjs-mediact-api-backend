import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as AdPartnercontroller from '../controllers/adPartnerController';

const router = new Router({ prefix: "/ad-partners" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', AdPartnercontroller.getAllAdPartner);
router.get('/:id', AdPartnercontroller.getPartnerById);
router.post('/', AdPartnercontroller.createAdPartner);
router.put('/:id', AdPartnercontroller.updateAdPartner);
router.delete('/:id', AdPartnercontroller.deleteAdPartner);

export default router;