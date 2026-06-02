import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as PartnerAddressController from '../controllers/partnerAddressController';

const router = new Router({ prefix: '/partner-addresses' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post('/', PartnerAddressController.createPartnerAddress);
router.get('/', PartnerAddressController.getAllPartnerAddresses);
router.get('/:id', PartnerAddressController.getPartnerAddressById);
router.get('/partner/:id', PartnerAddressController.getPartnerAddressByPartnerId);
router.put('/:id', PartnerAddressController.updatePartnerAddress);
router.delete('/:id', PartnerAddressController.deletePartnerAddress);

export default router;
