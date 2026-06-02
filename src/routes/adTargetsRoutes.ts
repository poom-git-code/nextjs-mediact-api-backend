import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
    createAdTarget,
    getAdTargetById,
    getAdTargetsByAdId,
    updateAdTarget,
    getAllAdTarget,
    deleteAdTarget,
} from '../controllers/adTargetsController';

const router = new Router({ prefix: '/ad-targets' });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// POST /ad-targets
router.post('/', createAdTarget);

// GET /ad-targets/:id
router.get('/:id', getAdTargetById);

// GET /ad-targets/by-ad/:adId
router.get('/by-ad/:adId', getAdTargetsByAdId);

// PUT /ad-targets/:id
router.put('/:id', updateAdTarget);

router.get('/', getAllAdTarget);

router.delete('/:id', deleteAdTarget);

export default router;
