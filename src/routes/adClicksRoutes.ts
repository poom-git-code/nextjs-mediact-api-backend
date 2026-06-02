import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
    createAdClick,
    getAllAdClicks,
    getAdClickById,
} from '../controllers/adClicksController';

const router = new Router({
    prefix: '/ad-clicks', // Prefix for all ad click routes
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Create a new ad click
router.post('/', createAdClick);

// Get all ad clicks
router.get('/', getAllAdClicks);

// Get ad click by ID
router.get('/:id', getAdClickById);

export default router;
