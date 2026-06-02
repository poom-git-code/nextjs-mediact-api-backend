import { Context } from "koa";
import * as BoothEventListService from "../services/boothEventListService";
import BoothEventListModel from "../models/BoothListModel";
import BoothEventModel from "../models/BoothEventModel";
import Joi from "joi";
import {
  createBoothEventListSchema,
  updateBoothEventListSchema,
} from "../validations/boothEventListValidation";

export const createBoothEventList = async (ctx: Context) => {
  const data = ctx.request.body;
  const { error, value } = createBoothEventListSchema.validate(data);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }
  try {
    const booth = await BoothEventListService.createBoothEventList(
      { ...value, created_by: userId, updated_by: userId },
      userId
    );
    ctx.status = 201;
    ctx.body = { message: "Booth created successfully", booth };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const updateBoothEventList = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  const { error, value } = updateBoothEventListSchema.validate(updates);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }
  try {
    const booth = await BoothEventListService.updateBoothEventList(
      Number(id),
      { ...value, updated_by: userId },
      userId
    );
    ctx.body = { message: "Booth updated successfully", booth };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const deleteBoothEventList = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const booth = await BoothEventListModel.findByPk(id);
    if (!booth) {
      ctx.status = 404;
      ctx.body = { error: "Booth not found" };
      return;
    }

    await BoothEventListModel.destroy({ where: { id } });

    ctx.body = { message: "Booth deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getBoothListByEventId = async (ctx: Context) => {
  try {
    const booths = await BoothEventListService.getBoothListByEventId(
      Number(ctx.params.id)
    );
    ctx.body = { booths };
  } catch (error) {
    ctx.status = 404;
    ctx.body = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getAllBoothEventLists = async (ctx: Context) => {
  try {
    const booths = await BoothEventListService.getAllBoothEventLists();
    ctx.body = { booths };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getBoothListbyIsActive = async (ctx: Context) => {
  try {
    const booths = await BoothEventListService.getBoothListByIsActive();
    ctx.status = 200;
    ctx.body = booths;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Failed to get booth list." };
  }
};

export const getAllBoothEventListsManagement = async (ctx: Context) => {
  try {
    const booths =
      await BoothEventListService.getAllBoothEventListsManagement();
    ctx.body = { booths };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
