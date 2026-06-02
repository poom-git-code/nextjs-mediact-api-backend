import { Context } from "koa";
import * as AdTypeService from '../services/adTypeService';

export const getAllAdsTypes = async (ctx: Context) => {
    ctx.body = { ad_types: await AdTypeService.getAllAdsType() };
};

export const getAdTypeById = async (ctx: Context) => {
    const ad_type = await AdTypeService.getAdTypeById(parseInt(ctx.params.id));
    if (!ad_type) {
        ctx.status = 404;
        ctx.body = { error: "Ad type not found" };
        return;
    }
    ctx.body = { ad_type };
};

export const createAdType = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        // console.log('Decoded userId:', userId);
        const ad_type = await AdTypeService.createAdType(ctx.request.body, userId);
        ctx.body = { ad_type };
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: (error as Error).message };
    }
};

export const updateAdType = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        const ad_type = await AdTypeService.updateAdType(Number(ctx.params.id), ctx.request.body, userId);
        ctx.body = { ad_type };
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: (error as Error).message };
    }
};

export const deleteAdType = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        await AdTypeService.deleteAdType(parseInt(ctx.params.id), userId);
        ctx.body = { success: true };
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: (error as Error).message };
    }
};