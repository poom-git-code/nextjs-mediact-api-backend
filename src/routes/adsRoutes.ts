import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as AdsController from '../controllers/adsController';

const router = new Router({ prefix: "/ads" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/images', AdsController.getAdsImages);
router.get('/images-big', AdsController.getAdsImagesBig);
router.get('/', AdsController.getAllAds);
router.get('/:id', AdsController.getAdById);
router.post('/', AdsController.createAd);
router.put('/:id', AdsController.updateAd);
router.delete('/:id', AdsController.deleteAd);

export default router;