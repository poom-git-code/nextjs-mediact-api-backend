import { Context } from "koa";
import * as PartnerSubscriptionService from "../services/partnerSubscriptionService";

/**
 * Get subscription features for a specific facility
 * GET /partner-subscriptions/facility/:id/features
 */
export const getFacilityFeatures = async (ctx: Context) => {
    try {
        const facilityId = parseInt(ctx.params.id, 10);
        
        if (isNaN(facilityId)) {
            ctx.status = 400;
            ctx.body = { error: "Invalid facility ID" };
            return;
        }

        const facilitySubscription = await PartnerSubscriptionService.getFacilitySubscriptionFeatures(facilityId);
        
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: facilitySubscription
        };
    } catch (error) {
        ctx.status = 404;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

/**
 * Check if a specific feature is available for a facility
 * GET /partner-subscriptions/facility/:id/features/:feature
 */
export const checkFacilityFeature = async (ctx: Context) => {
    try {
        const facilityId = parseInt(ctx.params.id, 10);
        const feature = ctx.params.feature as 'full_schedule' | 'mediact_match';
        
        if (isNaN(facilityId)) {
            ctx.status = 400;
            ctx.body = { error: "Invalid facility ID" };
            return;
        }

        if (!['full_schedule', 'mediact_match'].includes(feature)) {
            ctx.status = 400;
            ctx.body = { error: "Invalid feature. Must be 'full_schedule' or 'mediact_match'" };
            return;
        }

        const isAvailable = await PartnerSubscriptionService.checkFacilityFeatureAvailability(facilityId, feature);
        
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: {
                facility_id: facilityId,
                feature: feature,
                available: isAvailable
            }
        };
    } catch (error) {
        ctx.status = 404;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

/**
 * Get all facilities with their subscription features
 * GET /partner-subscriptions/facilities/features
 */
export const getAllFacilitiesFeatures = async (ctx: Context) => {
    try {
        const facilitiesSubscriptions = await PartnerSubscriptionService.getAllFacilitiesSubscriptionFeatures();
        
        ctx.status = 200;
        ctx.body = {
            success: true,
            data: facilitiesSubscriptions,
            count: facilitiesSubscriptions.length
        };
    } catch (error) {
        ctx.status = 500;
        if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};