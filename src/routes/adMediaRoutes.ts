import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
    createAdMedia,
    getAdMediaById,
    getAdMediaByAdId,
    updateAdMedia,
    getAllAdMedia,
    deleteAdMedia,
    getActiveAdMedia,
    getRandomAdMedia,
    getAdMediaSortedByImpression,
    getAdMediaForUser,
} from '../controllers/adMediaController';

const router = new Router({
    prefix: '/ad-medias',
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/target', getAdMediaForUser)

router.get('/sorted-by-impression', getAdMediaSortedByImpression);

router.get('/random', getRandomAdMedia)

router.get('/active', getActiveAdMedia);

// สร้าง media ใหม่
router.post('/', createAdMedia);

// ดึง media ตาม ID ของ media
router.get('/:id', getAdMediaById);

// ดึง media ทั้งหมดของโฆษณา (ad) ตาม ad_id
router.get('/by-ad/:adId', getAdMediaByAdId);

// ดึง media ทั้งหมดในระบบ (View All)
router.get('/', getAllAdMedia);

// แก้ไข media ตาม ID
router.put('/:id', updateAdMedia);

router.delete('/:id', deleteAdMedia);

export default router;
