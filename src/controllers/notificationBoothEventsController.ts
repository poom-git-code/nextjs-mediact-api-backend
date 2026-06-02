import { Context } from "koa";
import * as NotificationService from "../services/notificationBoothEventsService";
import { createNotificationSchema } from "../validations/notificationBoothEventsValidation";

export const createNotification = async (ctx: Context) => {
    const { error, value } = createNotificationSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    const createdBy = ctx.state.user?.id;

    try {
        const notification = await NotificationService.createNotification({
            ...value,
            created_by: createdBy,
        });
        ctx.status = 201;
        ctx.body = { message: "Notification created", notification };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err instanceof Error ? err.message : "Unknown error" };
    }
};

export const createNotificationNoJob = async (ctx: Context) => {
    const { error, value } = createNotificationSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    const createdBy = ctx.state.user?.id;

    try {
        const notification = await NotificationService.createNotificationNoJob({
            ...value,
            created_by: createdBy,
        });
        ctx.status = 201;
        ctx.body = { message: "Notification created", notification };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err instanceof Error ? err.message : "Unknown error" };
    }
};

export const updateNotification = async (ctx: Context) => {
    const { id } = ctx.params;
    const { error, value } = createNotificationSchema.validate(ctx.request.body); // ใช้ schema เดียวกัน
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    const updatedBy = ctx.state.user?.id;

    try {
        const updated = await NotificationService.updateNotification(parseInt(id), {
            ...value,
            updated_by: updatedBy,
        });
        ctx.body = { message: "Notification updated", updated };
    } catch (err) {
        ctx.status = 404;
        ctx.body = { error: err instanceof Error ? err.message : "Unknown error" };
    }
};

export const getNotificationById = async (ctx: Context) => {
    const { id } = ctx.params;

    try {
        const notification = await NotificationService.getNotificationById(parseInt(id));
        ctx.body = { notification };
    } catch (err) {
        ctx.status = 404;
        ctx.body = { error: err instanceof Error ? err.message : "Notification not found" };
    }
};

export const getAllNotifications = async (ctx: Context) => {
    try {
        const notifications = await NotificationService.getAllNotifications();
        ctx.body = { notifications };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: err instanceof Error ? err.message : "Unknown error" };
    }
};

export const deleteNotification = async (ctx: Context) => {
    const { id } = ctx.params;
    const userId = ctx.state.user?.id;

    try {
        const result = await NotificationService.deleteNotification(parseInt(id), userId);
        ctx.body = result;
    } catch (err) {
        ctx.status = 404;
        ctx.body = { error: err instanceof Error ? err.message : "Notification not found" };
    }
};
