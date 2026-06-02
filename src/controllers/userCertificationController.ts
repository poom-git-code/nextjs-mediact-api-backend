import { Context } from "koa";
import * as UserCertificationService from "../services/userCertificationService";

export const getAllUserCertifications = async (ctx: Context) => {
  ctx.body = {
    user_certifications:
      await UserCertificationService.getAllUserCertifications(),
  };
};

export const getUserCertificationById = async (ctx: Context) => {
  const record = await UserCertificationService.getUserCertificationById(
    Number(ctx.params.id)
  );
  if (!record) {
    ctx.status = 404;
    ctx.body = { error: "User certification not found" };
    return;
  }
  ctx.body = { user_certification: record };
};

export const getUserCertificationsByToken = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  const record = await UserCertificationService.getUserCertificationsByToken(
    userId
  );
  if (!record) {
    ctx.status = 404;
    ctx.body = { error: "User certification not found" };
    return;
  }
  ctx.body = { user_certifications: record };
  console.log("User certification retrieved:", record);
};

export const getUserCertificationsByUserId = async (ctx: Context) => {
  // const user_id = ctx.state.user?.id;

  const targetUserId = Number(ctx.params.id);

  if (!targetUserId || isNaN(targetUserId)) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: "Target User ID missing or invalid in URL parameter",
    };
    return;
  }

  try {
    const certifications =
      await UserCertificationService.getUserCertificationsByUserId(
        targetUserId
      );

    if (!certifications) {
      ctx.status = 404;
      ctx.body = { user_certifications: [] };
      return;
    }

    ctx.body = {
      user_certifications: certifications,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
};

export const createUserCertification = async (ctx: Context) => {
  try {
    const requestData = ctx.request.body;
    const file = ctx.request.files?.file as any;
    console.log("Creating user certification with data:", ctx.request.body);

    const targetUserId = requestData.user_id || ctx.state.user?.id;

    if (!targetUserId) {
      ctx.status = 400;
      ctx.body = { error: "User ID is missing." };
      return;
    }

    if (file && !Array.isArray(file)) {
      const record =
        await UserCertificationService.createUserCertificationWithFile(
          requestData,
          file,
          targetUserId
        );
      ctx.body = record;
    } else {
      // Use the original function without file
      const record = await UserCertificationService.createUserCertification(
        requestData,
        targetUserId
      );
      ctx.body = { user_certification: record };
    }
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateUserCertification = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const file = ctx.request.files?.file as any;
    const updates = ctx.request.body;

    const record = await UserCertificationService.updateUserCertification(
      Number(ctx.params.id),
      updates,
      userId,
      file
    );

    ctx.body = { user_certification: record };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteUserCertification = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await UserCertificationService.deleteUserCertification(
      Number(ctx.params.id),
      userId
    );
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};
