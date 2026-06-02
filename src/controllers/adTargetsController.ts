import { Context } from 'koa';
import Joi from 'joi';
import * as AdTargetService from '../services/adTargetsService';
import {
    createAdTargetSchema,
    updateAdTargetSchema,
} from '../validations/adTargetsValidation';

// Create ad target
export const createAdTarget = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id
        const validatedData = await createAdTargetSchema.validateAsync(ctx.request.body);
        const newTarget = await AdTargetService.createAdTarget(validatedData, userId);
        ctx.status = 201;
        ctx.body = { message: 'Ad target created successfully', target: newTarget };
    } catch (error: any) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else {
            ctx.body = { error: error.message || 'Failed to create ad target' };
        }
    }
};

// Get ad target by ID
export const getAdTargetById = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const target = await AdTargetService.getAdTargetById(id);
        ctx.body = { target };
    } catch (error: any) {
        ctx.status = 404;
        ctx.body = { error: error.message || 'Ad target not found' };
    }
};

// Get all ad targets by ad ID
export const getAdTargetsByAdId = async (ctx: Context) => {
    try {
        const adId = parseInt(ctx.params.adId);
        const targets = await AdTargetService.getAdTargetsByAdId(adId);
        ctx.body = { targets };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message || 'Failed to fetch ad targets' };
    }
};

// Update ad target
export const updateAdTarget = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id
        const id = parseInt(ctx.params.id);
        const validatedData = await updateAdTargetSchema.validateAsync(ctx.request.body);
        const updatedTarget = await AdTargetService.updateAdTarget(id, validatedData, userId);
        ctx.body = { message: 'Ad target updated successfully', target: updatedTarget };
    } catch (error: any) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else {
            ctx.body = { error: error.message || 'Failed to update ad target' };
        }
    }
};

export const getAllAdTarget = async (ctx: Context) => {
    try {
        const targetList = await AdTargetService.getAllAdTarget();
        ctx.body = { ad_targets: targetList };
    } catch (error: unknown) {
        ctx.status = 500;
        ctx.body = { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
};

export const deleteAdTarget = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const userId = ctx.state.user?.id;
        await AdTargetService.deleteAdTarget(id, userId)
        ctx.body = { success: true };
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: (error as Error).message };
    }
}