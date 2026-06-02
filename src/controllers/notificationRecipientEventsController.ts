import { Context } from "koa";
import * as NotificationRecipientService from "../services/notificationRecipientEventsService";

export const createRecipients = async (ctx: Context) => {
    const { notification_id, user_ids } = ctx.request.body;
    const createdBy = ctx.state.user?.id;

    if (!Array.isArray(user_ids) || !notification_id) {
        ctx.status = 400;
        ctx.body = { error: "Missing notification_id or user_ids" };
        return;
    }

    try {
        const recipients = await NotificationRecipientService.createRecipients(
            notification_id,
            user_ids,
            createdBy
        );
        ctx.status = 201;
        ctx.body = { message: "Recipients created", recipients };
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: error instanceof Error ? error.message : "Unknown error" };
    }
};

export const getRecipientsByNotification = async (ctx: Context) => {
    const { notification_id } = ctx.params;

    try {
        const recipients = await NotificationRecipientService.getRecipientsByNotification(
            parseInt(notification_id, 10)
        );
        ctx.body = { recipients };
    } catch (error) {
        ctx.status = 404;
        ctx.body = { error: error instanceof Error ? error.message : "Unknown error" };
    }
};

export const markNotificationAsRead = async (ctx: Context) => {
    const { notification_id } = ctx.params;
    const userId = ctx.state.user?.id;

    try {
        const result = await NotificationRecipientService.markAsRead(
            parseInt(notification_id, 10),
            userId
        );
        ctx.body = { message: "Notification marked as read", result };
    } catch (error) {
        ctx.status = 400;
        ctx.body = {
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

export const markNotificationAsResponded = async (ctx: Context) => {
    const { notification_id } = ctx.params;
    const userId = ctx.state.user?.id;

    try {
        const result = await NotificationRecipientService.markAsResponded(
            parseInt(notification_id, 10),
            userId
        );
        ctx.body = { message: "Notification marked as responded", result };
    } catch (error) {
        ctx.status = 400;
        ctx.body = {
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

export const getUserNotifications = async (ctx: Context) => {
    const userId = ctx.state.user?.id;

    try {
        const notifications = await NotificationRecipientService.getNotificationsForUser(userId);
        ctx.body = { notifications };
    } catch (error) {
        ctx.status = 400;
        ctx.body = {
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};