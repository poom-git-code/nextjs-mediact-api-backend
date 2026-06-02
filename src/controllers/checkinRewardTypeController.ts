import { Context } from "koa";
import {
  createRewardType,
  getRewardTypes,
  getRewardTypeById,
  updateRewardType,
  deleteRewardType,
} from "../services/checkInReawardTypeService";

export const listRewardTypes = async (ctx: Context) => {
  const language = ctx.state.language || "th";
  const rewardTypes = await getRewardTypes(language);
  ctx.body = rewardTypes;
};

export const getRewardType = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const language = ctx.state.language || "th";
  const rewardType = await getRewardTypeById(id, language);
  ctx.body = rewardType;
};

export const createRewardTypeController = async (ctx: Context) => {
  const data = ctx.request.body;
  const userId = Number(ctx.params.id);
  const rewardType = await createRewardType(data, userId);
  ctx.body = rewardType;
};

export const updateRewardTypeController = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const data = ctx.request.body;
  const rewardType = await updateRewardType(id, data);
  ctx.body = rewardType;
};

export const deleteRewardTypeController = async (ctx: Context) => {
  const id = Number(ctx.params.id);
  const result = await deleteRewardType(id);
  ctx.body = result;
};
