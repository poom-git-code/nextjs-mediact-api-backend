import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as AddressTypeController from '../controllers/addressTypeController';

const router = new Router({ prefix: "/address-types" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', AddressTypeController.getAllAddressTypes);
router.get('/management', AddressTypeController.getAllAddressTypesManagement);
router.get('/:id', AddressTypeController.getAddressTypeById);
router.post('/', AddressTypeController.createAddressType);
router.put('/:id', AddressTypeController.updateAddressType);
router.delete('/:id', AddressTypeController.deleteAddressType);

export default router;