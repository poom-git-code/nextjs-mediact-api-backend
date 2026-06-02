import { Context } from 'koa';
import Joi from 'joi';
import * as AdMediaService from '../services/adMediaService';
import {
    createAdMediaSchema,
    updateAdMediaSchema,
} from '../validations/adMediaValidation';

// Create new ad media
export const createAdMedia = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id
        const validatedData = await createAdMediaSchema.validateAsync(ctx.request.body);
        const newMedia = await AdMediaService.createAdMedia(validatedData, userId);
        ctx.status = 201;
        ctx.body = { message: 'Ad media created successfully', data: newMedia };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = {
            error: error instanceof Joi.ValidationError ? error.details[0].message : error.message,
        };
    }
};

// Get ad media by ID
export const getAdMediaById = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const media = await AdMediaService.getAdMediaById(id);
        ctx.body = { data: media };
    } catch (error: any) {
        ctx.status = 404;
        ctx.body = { error: error.message };
    }
};

// Get all media by ad ID
export const getAdMediaByAdId = async (ctx: Context) => {
    try {
        const adId = parseInt(ctx.params.adId);
        const mediaList = await AdMediaService.getAdMediaByAdId(adId);
        ctx.body = { data: mediaList };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

// Update ad media
export const updateAdMedia = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const userId = ctx.state.user?.id;
        const validatedData = await updateAdMediaSchema.validateAsync(ctx.request.body);
        const updated = await AdMediaService.updateAdMedia(id, validatedData, userId);
        ctx.body = { message: 'Ad media updated successfully', data: updated };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = {
            error: error instanceof Joi.ValidationError ? error.details[0].message : error.message,
        };
    }
};

// ดึงรายการ media ทั้งหมด
export const getAllAdMedia = async (ctx: Context) => {
    try {
        const mediaList = await AdMediaService.getAllAdMedia();
        ctx.body = { media: mediaList };
    } catch (error: unknown) {
        ctx.status = 500;
        ctx.body = { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
};

export const deleteAdMedia = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id)
        const userId = ctx.state.user?.id;
        await AdMediaService.deleteAdMedia(id, userId)
        ctx.body = { success: true }
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: (error as Error).message };
    }
}

export const getActiveAdMedia = async (ctx: Context) => {
    try {
        const mediaList = await AdMediaService.getAllActiveAdMediaWithAdUrl()
        ctx.status = 200
        ctx.body = { medias: mediaList }
    } catch (error: any) {
        ctx.status = 400
        ctx.body = { error: (error as Error).message };
    }
}

export const getRandomAdMedia = async (ctx: Context) => {
    try {
        const media = await AdMediaService.getWeightedRandomAdMedia()

        if (!media) {
            ctx.status = 404
            ctx.body = { message: 'No Active ad media available' }
            return
        }

        ctx.status = 200
        ctx.body = { media }
    } catch (error: any) {
        ctx.status = 500
        ctx.body = { error: (error as Error).message || 'Unexpected error' }
    }
}

export const getAdMediaSortedByImpression = async (ctx: Context) => {
    try {
        const mediaList = await AdMediaService.getSortedActiveAdMediaByImpression();
        ctx.status = 200;
        ctx.body = { medias: mediaList };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

export const getAdMediaForUser = async (ctx: Context) => {
    try {
        // const userId = parseInt(ctx.params.userId || ctx.query.userId)
        const userId = ctx.state.user.id

        if (!userId || isNaN(userId)) {
            ctx.status = 400
            ctx.body = { error: 'Invalid or missing userId' }
            return
        }

        const ads = await AdMediaService.getAdMediaFilterByTarget(userId)

        ctx.status = 200
        ctx.body = { medias: ads }
    } catch (error: any) {
        ctx.status = 500
        ctx.body = { error: (error as Error).message }
    }
}
