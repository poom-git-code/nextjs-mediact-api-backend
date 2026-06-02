import { Context } from "koa";
import Joi from "joi";
import * as AdImpressionService from "../services/adImpressionsService";
import {
    createAdImpressionSchema,
} from "../validations/adImpressionsValidation";

// Create ad impression
export const createAdImpression = async (ctx: Context) => {
    try {
        // Validate request body
        const validatedData = await createAdImpressionSchema.validateAsync(ctx.request.body);

        // ดึง userId จาก JWT (หรือ middleware auth)
        const userId = ctx.state.user?.id;

        if (!userId) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: userId not found in context' };
            return;
        }

        // เรียก service ใหม่ที่รวม logic impression + credit log
        const newAdImpression = await AdImpressionService.createAdImpressionWithCreditLog(validatedData, userId);

        ctx.status = 201;
        ctx.body = { message: 'Ad impression created successfully', adImpression: newAdImpression };
    } catch (error: unknown) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: 'Unknown error occurred' };
        }
    }
};

// Get all ad impressions
export const getAllAdImpressions = async (ctx: Context) => {
    try {
        const adImpressions = await AdImpressionService.getAllAdImpressions();
        ctx.body = { adImpressions };
    } catch (error: any) {
        ctx.status = 500;
        ctx.body = { error: error.message || "Failed to fetch ad impressions" };
    }
};

// Get ad impression by ID
export const getAdImpressionById = async (ctx: Context) => {
    try {
        const id = Number(ctx.params.id);
        const adImpression = await AdImpressionService.getAdImpressionById(id);
        ctx.body = { adImpression };
    } catch (error: any) {
        ctx.status = 404;
        ctx.body = { error: error.message || "Ad impression not found" };
    }
};
