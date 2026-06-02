import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as PartnerSubscriptionController from '../controllers/partnerSubscriptionController';

const router = new Router({ prefix: "/partner-subscriptions" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

/**
 * @route   GET /partner-subscriptions/facility/:id/features
 * @desc    Get all subscription features for a specific facility
 * @access  Private (requires authentication)
 */
router.get('/facility/:id/features', PartnerSubscriptionController.getFacilityFeatures);

/**
 * @route   GET /partner-subscriptions/facility/:id/features/:feature
 * @desc    Check availability of a specific feature for a facility
 * @param   {string} feature - Feature name ('full_schedule' or 'mediact_match')
 * @access  Private (requires authentication)
 */
router.get('/facility/:id/features/:feature', PartnerSubscriptionController.checkFacilityFeature);

/**
 * @route   GET /partner-subscriptions/facilities/features
 * @desc    Get subscription features for all facilities
 * @access  Private (requires authentication)
 */
router.get('/facilities/features', PartnerSubscriptionController.getAllFacilitiesFeatures);

export default router;