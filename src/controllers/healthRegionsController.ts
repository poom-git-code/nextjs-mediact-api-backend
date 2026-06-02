import { Context } from "koa";
import * as HealthRegionsService from "../services/healthRegionsService";
import { validateHealthRegionQuery, validateHealthRegionCreate, validateHealthRegionUpdate } from "../validations/healthRegionsValidation";

export const getAllHealthRegions = async (ctx: Context) => {
  try {
    const { error, value } = validateHealthRegionQuery(ctx.query);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const filters = {
      include_provinces: value.include_provinces === 'true',
      page: value.page ? Number(value.page) : undefined,
      limit: value.limit ? Number(value.limit) : undefined,
    };

    const result = await HealthRegionsService.getAllHealthRegions(filters);
    ctx.body = { health_regions: result };
  } catch (error) {
    console.error('Error getting health regions:', error);
    ctx.status = 500;
    ctx.body = { error: "Internal server error" };
  }
};

export const getHealthRegionById = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    const include_provinces = ctx.query.include_provinces === 'true';

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid health region ID" };
      return;
    }

    const healthRegion = await HealthRegionsService.getHealthRegionById(id, include_provinces);
    ctx.body = { health_region: healthRegion };
  } catch (error) {
    if ((error as Error).message === "Health region not found") {
      ctx.status = 404;
      ctx.body = { error: "Health region not found" };
    } else {
      console.error('Error getting health region by ID:', error);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
    }
  }
};

export const createHealthRegion = async (ctx: Context) => {
  try {
    const { error, value } = validateHealthRegionCreate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "User not authenticated" };
      return;
    }

    const healthRegion = await HealthRegionsService.createHealthRegion(value, userId);
    ctx.status = 201;
    ctx.body = { health_region: healthRegion };
  } catch (error) {
    console.error('Error creating health region:', error);
    ctx.status = 500;
    ctx.body = { error: "Internal server error" };
  }
};

export const updateHealthRegion = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid health region ID" };
      return;
    }

    const { error, value } = validateHealthRegionUpdate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "User not authenticated" };
      return;
    }

    const healthRegion = await HealthRegionsService.updateHealthRegion(id, value, userId);
    ctx.body = { health_region: healthRegion };
  } catch (error) {
    if ((error as Error).message === "Health region not found") {
      ctx.status = 404;
      ctx.body = { error: "Health region not found" };
    } else {
      console.error('Error updating health region:', error);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
    }
  }
};

export const deleteHealthRegion = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid health region ID" };
      return;
    }

    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "User not authenticated" };
      return;
    }

    const result = await HealthRegionsService.deleteHealthRegion(id, userId);
    ctx.body = { success: true, ...result };
  } catch (error) {
    if ((error as Error).message === "Health region not found") {
      ctx.status = 404;
      ctx.body = { error: "Health region not found" };
    } else {
      console.error('Error deleting health region:', error);
      ctx.status = 500;
      ctx.body = { error: "Internal server error" };
    }
  }
};
