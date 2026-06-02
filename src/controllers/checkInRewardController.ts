import { Context } from "koa";
import {
  getRewards,
  getAllRewards,
  redeemReward,
  getUserRedemptions,
  getUserRewardsOverview,
  getAllRedemptions,
  getRedemptionDetails,
  completeRedemption,
  createReward,
  updateReward,
  deleteReward,
  rejectRefund,
  getRewardById as getRewardByIdService,
  deactivateExpiredRewards,
  importRewards,
  getDistinctRewards,
} from "../services/checkInRewardService";
// import fs from "fs";
import fs from "fs/promises"; // ** Import fs/promises **
// import { uploadPublicFileToSpace } from "../services/uploadService";

export const listRewards = async (ctx: Context) => {
  const rewards = await getRewards();
  ctx.body = rewards;
};

export const listAllRewards = async (ctx: Context) => {
  try {
    const rewards = await getAllRewards();
    ctx.body = rewards;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
};

export const redeemRewardById = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const rewardId = ctx.request.body.id;

  console.log("User ID:", userId);
  console.log("Reward ID:", rewardId);

  try {
    const redemption = await redeemReward(userId, rewardId);
    ctx.body = redemption;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const listUserRedemptions = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const redemptions = await getUserRedemptions(userId);
    ctx.body = redemptions;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
};

export const getUserRewardsOverviewController = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const overview = await getUserRewardsOverview(userId);
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: overview,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const listAllRedemptions = async (ctx: Context) => {
  try {
    const redemptions = await getAllRedemptions();
    ctx.body = redemptions;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
};

export const getRedemptionById = async (ctx: Context) => {
  const redemptionId = Number(ctx.params.id);
  const redemption = await getRedemptionDetails(redemptionId);
  ctx.body = redemption;
};

export const completeRedemptionById = async (ctx: Context) => {
  const redemptionId = Number(ctx.params.id);

  try {
    const redemption = await completeRedemption(redemptionId);
    ctx.body = redemption;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const createRewardController = async (ctx: Context) => {
  const data = ctx.request.body as any;
  const userId = ctx.state.user?.id;

  if (!data.title || data.points_required === undefined) {
    ctx.status = 400;
    ctx.body = { message: "Title and points_required are required" };
    return;
  }

  try {
    const rewardPayload = {
      title: data.title,
      description: data.description,
      conditions: data.conditions || null,
      image_url: data.image_url,
      points_required: data.points_required,
      expiry_date: data.expiry_date || null,
      is_active: data.is_active,
      stock_quantity: data.stock_quantity,
      type_id: data.type_id,
      brand_id: data.brand_id || null,
      redeem_code: data.redeem_code || null,
      created_by: userId,
      updated_by: userId,
    };

    const reward = await createReward(rewardPayload);

    ctx.status = 201;
    ctx.body = { success: true, data: reward };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message || "Failed to create reward",
    };
  }
};

export const updateRewardController = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    const data = ctx.request.body as any;
    const userId = ctx.state.user?.id;

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { message: "Invalid reward ID format" };
      return;
    }

    const rewardPayload = {
      ...data,
      updated_by: userId,
    };

    const reward = await updateReward(id, rewardPayload);

    ctx.status = 200;
    ctx.body = { success: true, data: reward };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message || "Failed to update reward",
    };
  }
};

export const deleteRewardController = async (ctx: Context) => {
  const id = Number(ctx.params.id);

  if (!id) {
    ctx.status = 400;
    ctx.body = { error: "Reward ID is required" };
    return;
  }

  try {
    const result = await deleteReward(id);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
};

export const rejectRefundById = async (ctx: Context) => {
  const redemptionId = Number(ctx.params.id);

  try {
    const redemption = await rejectRefund(redemptionId);
    ctx.body = redemption;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const getRewardById = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { error: "Invalid reward ID format" };
      return;
    }
    const userId = ctx.state.user?.id;
    const reward = await getRewardByIdService(id, userId);
    ctx.body = reward;
  } catch (error) {
    ctx.status = 404;
    ctx.body = { error: (error as Error).message };
  }
};

export const runRewardExpiryCheckController = async (ctx: Context) => {
  try {
    const result = await deactivateExpiredRewards();
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "Reward expiry check completed",
      data: result,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const importRewardsController = async (ctx: Context) => {
  const files = ctx.request.files;
  const body = ctx.request.body;

  // Handle กรณีที่ koa-body อาจส่งมาเป็น Array หรือ Object เดี่ยวๆ
  let uploadedFile: any = null;
  if (files?.excelFile) {
    uploadedFile = Array.isArray(files.excelFile)
      ? files.excelFile[0]
      : files.excelFile;
  }

  const userId = ctx.state.user?.id;
  const tempFilePath = uploadedFile?.filepath || uploadedFile?.path;

  if (!tempFilePath) {
    ctx.status = 400;
    ctx.body = { error: "No Excel/CSV file uploaded." };
    return;
  }

  const commonData = body as any;

  const importConfig = {
    image_url: commonData.image_url || "",
    is_active: true,
    created_by: userId,
    updated_by: userId,
  };

  try {
    const result = await importRewards(tempFilePath, importConfig);
    ctx.body = result;
    ctx.status = 200;
  } catch (error: any) {
    let errorMessage = error.message;
    if (error.name === "SequelizeUniqueConstraintError") {
      errorMessage = "Duplicate redeem codes found in database.";
    }
    ctx.status = 400;
    ctx.body = { error: errorMessage };
  } finally {
    //  ลบไฟล์ Temp ทิ้งเสมอ
    try {
      if (tempFilePath) await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      console.error("Failed to delete temp file:", cleanupError);
    }
  }
};

export const listDistinctRewards = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.id;
    const rewards = await getDistinctRewards(userId);

    ctx.status = 200;
    ctx.body = {
      success: true,
      count: rewards.length,
      data: rewards,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: (error as Error).message,
    };
  }
};
