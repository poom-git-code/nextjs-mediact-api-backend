import { Context } from "koa";
import * as Service from "../services/eventRewardsService";
import { createRewardSchema } from "../validations/eventRewardsValidation";

export const createReward = async (ctx: Context) => {
  const { error, value } = createRewardSchema.validate(ctx.request.body);
  try {
    const userId = ctx.state.user.id;
    const reward = await Service.createReward(userId);

    ctx.status = 201;
    ctx.body = { reward };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message || "Failed to create reward." };
  }
};

export const getUserActiveReward = async (ctx: Context) => {
  const user_id = ctx.state.user?.id;
  if (!user_id) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  const result = await Service.getActiveRewardStatus(user_id);
  ctx.body = result;
};

// delete by booth_event_id
export const deleteRewardByBooth = async (ctx: Context) => {
  const booth_event_id = Number(ctx.params.id);
  const user_id = ctx.state.user?.id;

  if (!user_id) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    await Service.deleteRewardByBooth(booth_event_id, user_id);
    ctx.body = { message: "ลบ reward สำเร็จ" };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getUserRewards = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  const rewards = await Service.getRewardsByUser(userId);
  ctx.body = { rewards };
};
