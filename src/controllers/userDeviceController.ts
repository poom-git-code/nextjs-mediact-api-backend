import { Context } from "koa";
import * as UserDeviceService from "../services/userDeviceService";

export const registerDevice = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const device = await UserDeviceService.registerDevice(userId, ctx.request.body);
    ctx.body = { success: true, device };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateDevice = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const deviceId = ctx.request.body.device_id; // ดึง device id จาก body
    const device = await UserDeviceService.updateDevice(userId, deviceId, ctx.request.body);
    ctx.body = { success: true, device };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deactivateDevice = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const deviceId = ctx.request.body.device_id; // ดึง device id จาก body (string หรือ type ที่ใช้จริง)
    await UserDeviceService.deactivateDevice(userId, deviceId);
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const getMyDevices = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  ctx.body = { devices: await UserDeviceService.getMyDevices(userId) };
};

export const getUserDevicesByAdmin = async (ctx: Context) => {
  const userId = Number(ctx.params.user_id);
  ctx.body = { devices: await UserDeviceService.getUserDevicesByAdmin(userId) };
};