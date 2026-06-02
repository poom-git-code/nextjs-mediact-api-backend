import { Context } from "koa";
import * as Service from "../services/userEventStampsService";
import {
  createUserEventStampSchema,
  redeemStampSchema,
} from "../validations/userEventStampsValidation";

// export const scanStampFromUrl = async (ctx: Context) => {
//   try {
//     const { stamp_code, user_id } = ctx.request.body;

//     const result = await Service.addStamp(user_id, stamp_code);

//     ctx.status = 200;
//     ctx.body = { success: true, data: result };
//   } catch (error: any) {
//     ctx.status = 400;
//     ctx.body = { success: false, error: error.message };
//   }
// };

export const addStamp = async (ctx: Context) => {
  const stamp_code = ctx.params.stamp_code;
  const user_id = ctx.state.user.id;

  try {
    const result = await Service.addStamp(user_id, stamp_code);
    ctx.status = 200;
    ctx.body = { message: "Stamp added successfully", result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message || "Failed to add stamp" };
  }
};

export const getStamps = async (ctx: Context) => {
  const user_id = ctx.state.user?.id;
  if (!user_id) {
    ctx.status = 400;
    ctx.body = { error: "ต้องระบุ user_id" };
    return;
  }

  try {
    const stamps = await Service.getUserStamps(user_id);
    ctx.body = { stamps };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { error: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" };
  }
};

export const getUserStampsByUserId = async (ctx: Context) => {
  const user_id = ctx.state.user?.id;
  if (!user_id) {
    ctx.status = 400;
    ctx.body = { error: "ต้องระบุ user_id" };
    return;
  }

  try {
    const stamps = await Service.getUserStampsByUserId(Number(user_id));
    ctx.body = { stamps };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { error: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" };
  }
};

export const deleteUserStampByUserId = async (ctx: Context) => {
  const user_id = ctx.params.id;
  if (!user_id) {
    ctx.status = 400;
    ctx.body = { error: "ต้องระบุ user_id" };
    return;
  }

  try {
    await Service.deleteUserStampByUserId(Number(user_id));
    ctx.status = 204;
  } catch (err) {
    ctx.status = 400;
    ctx.body = { error: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" };
  }
};

// get user stamps management
export const getUserStampsManagement = async (ctx: Context) => {
  try {
    const result = await Service.getUserStampsManagement();
    ctx.body = { data: result };
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = { error: error.message || "Failed to fetch user stamps" };
  }
};
