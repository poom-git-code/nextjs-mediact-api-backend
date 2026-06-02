import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as addressController from '../controllers/addressController';

const router = new Router({ prefix: "/addresses" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/mobile', addressController.getAllUserAddressInfo);
router.post('/mobile', addressController.createAddressMobile);
// router.put('/mobile/:id', addressController.updateAddressMobile);

router.get('/', addressController.getAllAddresses);
router.get('/management', addressController.getAllAddressesManagement);
router.get('/management/user/:id', addressController.getAddressByUserIdManagement);
router.get('/user/:id', addressController.getAddressByUserId);
router.get('/:id', addressController.getAddressById);
router.post('/', addressController.createAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);

export default router;