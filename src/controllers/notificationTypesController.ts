// src/controllers/notificationTypesController.ts
import { Context } from "koa";
import * as NotificationTypesService from "../services/notificationTypesService";

export const createNotificationType = async (ctx: Context) => {
  try {
    const { type_code, type_name_th, type_name_en, sequence, is_active } = ctx.request.body;

    if (!type_code || !type_name_th || !type_name_en) {
      ctx.status = 400;
      ctx.body = { 
        status: "error", 
        message: "type_code, type_name_th, and type_name_en are required" 
      };
      return;
    }

    const notificationType = await NotificationTypesService.createNotificationType({
      type_code,
      type_name_th,
      type_name_en,
      sequence,
      is_active,
    });

    ctx.status = 201;
    ctx.body = { status: "success", data: notificationType };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { status: "error", message: error.message };
  }
};

export const getAllNotificationTypes = async (ctx: Context) => {
  try {
    const includeInactive = ctx.query.include_inactive === "true";
    const notificationTypes = await NotificationTypesService.getAllNotificationTypes(includeInactive);
    ctx.body = { status: "success", data: notificationTypes };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { status: "error", message: error.message };
  }
};

export const getNotificationTypeById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    const notificationType = await NotificationTypesService.getNotificationTypeById(id);
    ctx.body = { status: "success", data: notificationType };
  } catch (error: any) {
    ctx.status = error.message === "Notification type not found" ? 404 : 500;
    ctx.body = { status: "error", message: error.message };
  }
};

export const getNotificationTypeByCode = async (ctx: Context) => {
  try {
    const type_code = ctx.params.code;
    const notificationType = await NotificationTypesService.getNotificationTypeByCode(type_code);
    if (!notificationType) {
      ctx.status = 404;
      ctx.body = { status: "error", message: "Notification type not found" };
      return;
    }
    ctx.body = { status: "success", data: notificationType };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = { status: "error", message: error.message };
  }
};

export const updateNotificationType = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    const { type_code, type_name_th, type_name_en, sequence, is_active } = ctx.request.body;

    const notificationType = await NotificationTypesService.updateNotificationType(id, {
      type_code,
      type_name_th,
      type_name_en,
      sequence,
      is_active,
    });

    ctx.body = { status: "success", data: notificationType };
  } catch (error: any) {
    ctx.status = error.message === "Notification type not found" ? 404 : 500;
    ctx.body = { status: "error", message: error.message };
  }
};

export const deleteNotificationType = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    await NotificationTypesService.deleteNotificationType(id);
    ctx.body = { status: "success", message: "Notification type deleted successfully" };
  } catch (error: any) {
    ctx.status = error.message === "Notification type not found" ? 404 : 500;
    ctx.body = { status: "error", message: error.message };
  }
};

export const toggleNotificationTypeStatus = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    const notificationType = await NotificationTypesService.toggleNotificationTypeStatus(id);
    ctx.body = { 
      status: "success", 
      message: `Notification type ${notificationType.is_active ? 'activated' : 'deactivated'}`,
      data: notificationType 
    };
  } catch (error: any) {
    ctx.status = error.message === "Notification type not found" ? 404 : 500;
    ctx.body = { status: "error", message: error.message };
  }
};
