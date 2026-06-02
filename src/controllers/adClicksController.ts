import { Context } from "koa";
import Joi from "joi";
import * as AdClickService from "../services/adClicksService";
import {
    createAdClickSchema,
} from "../validations/adClicksValidation";

// Create ad click
export const createAdClick = async (ctx: Context) => {
    try {
        // Validate request body
        const validatedData = await createAdClickSchema.validateAsync(ctx.request.body);

        // ดึง userId จาก JWT (หรือ middleware auth)
        const userId = ctx.state.user?.id;

        if (!userId) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized: userId not found in context' };
            return;
        }

        // เรียก service ใหม่ที่รวม logic click + credit log
        const newAdClick = await AdClickService.createAdClickWithCreditLog(validatedData, userId);

        ctx.status = 201;
        ctx.body = { message: 'Ad click created successfully', adClick: newAdClick };
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


// Get all ad clicks
export const getAllAdClicks = async (ctx: Context) => {
    try {
        const adClicks = await AdClickService.getAllAdClicks();
        ctx.body = { adClicks };
    } catch (error: any) {
        ctx.status = 500;
        ctx.body = { error: error.message || "Failed to fetch ad clicks" };
    }
};

// Get ad click by ID
export const getAdClickById = async (ctx: Context) => {
    try {
        const id = Number(ctx.params.id);
        const adClick = await AdClickService.getAdClickById(id);
        ctx.body = { adClick };
    } catch (error: any) {
        ctx.status = 404;
        ctx.body = { error: error.message || "Ad click not found" };
    }
};
