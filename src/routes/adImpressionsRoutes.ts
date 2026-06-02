import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import {
    createAdImpression,
    getAllAdImpressions,
    getAdImpressionById,
} from '../controllers/adImpressionsController';

const router = new Router({
    prefix: '/ad-impressions', // Prefix for all ad impression routes
});

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

// Create a new ad impression
router.post('/', createAdImpression);

// Get all ad impressions
router.get('/', getAllAdImpressions);

// Get ad impression by ID
router.get('/:id', getAdImpressionById);

export default router;
