import { Context } from "koa";
import * as NotificationsService from "../services/notificationsService";
import * as UserNotificationsRepo from "../repositories/userNotificationsRepository";
import NotificationsModel from "../models/NotificationsModel";
import NotificationTypesModel from "../models/NotificationTypesModel";

// Admin → send notification
export const sendNotification = async (ctx: Context) => {
  const { title, message, notification_type_id, target_channel, target_value, channels } =
    ctx.request.body;
  const created_by = ctx.state.user.id; // ดึง user id จาก token

  const notification = await NotificationsService.sendNotification({
    title,
    message,
    notification_type_id,
    target_channel,
    target_value,
    channels,
    created_by, // ส่งเข้าไปใน service
    data: ctx.request.body.data || {}, // เพิ่ม field data
  });

  ctx.body = { status: "success", notification };
};

// User → get in-app notifications
export const getMyNotifications = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const notifications = await UserNotificationsRepo.getUserNotifications(
    userId
  );

  // Extract unique notification_ids for batch loading (ป้องกัน N+1)
  const notificationIds = [...new Set(notifications.map((n: any) => {
    const data = n.toJSON ? n.toJSON() : n;
    return data.notification_id;
  }))];

  // Batch load all notifications at once
  const notificationsMap = new Map();
  if (notificationIds.length > 0) {
    try {
      const notificationRecords = await NotificationsModel.findAll({
        where: {
          id: notificationIds
        },
        include: [
          {
            model: NotificationTypesModel,
            as: "notification_type",
            required: false,
          },
        ],
      });

      notificationRecords.forEach((notif: any) => {
        const notifData = notif.toJSON ? notif.toJSON() : notif;
        notificationsMap.set(notif.id, notifData);
      });
    } catch (error: any) {
      // Fallback without notification_type if error
      if (error.name === 'SequelizeDatabaseError' && (error.message.includes('notification_type') || error.message.includes('Unknown column'))) {
        const notificationRecords = await NotificationsModel.findAll({
          where: {
            id: notificationIds
          }
        });
        notificationRecords.forEach((notif: any) => {
          const notifData = notif.toJSON ? notif.toJSON() : notif;
          notificationsMap.set(notif.id, { ...notifData, notification_type: null });
        });
      } else {
        throw error;
      }
    }
  }

  // Map notifications with batch-loaded data
  const enriched = notifications.map((n: any) => {
    const {
      push_token,
      created_by,
      updated_by,
      created_at,
      updated_at,
      notification_id,
      ...rest
    } = n.toJSON ? n.toJSON() : n;

    const notification = notificationsMap.get(notification_id);
    
    return {
      ...rest,
      notification_id,
      sent_at: n.sent_at,
      title: notification?.title || null,
      message: notification?.message || null,
      data_payload: notification?.data_payload || null,
      notification_type: notification?.notification_type || null,
    };
  });

  ctx.body = enriched;
};

// User → get in-app notifications with pagination (lazy load)
export const getMyNotificationsWithPaging = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const page = parseInt(ctx.query.page as string) || 1;
  const limit = parseInt(ctx.query.limit as string) || 10;

  const result = await UserNotificationsRepo.getUserNotificationsWithPaging(
    userId,
    page,
    limit
  );

  // Extract unique notification_ids for batch loading
  const notificationIds = [...new Set(result.data.map((n: any) => {
    const data = n.toJSON ? n.toJSON() : n;
    return data.notification_id;
  }))];

  // Batch load all notifications at once
  const notificationsMap = new Map();
  if (notificationIds.length > 0) {
    try {
      const notificationRecords = await NotificationsModel.findAll({
        where: {
          id: notificationIds
        },
        include: [
          {
            model: NotificationTypesModel,
            as: "notification_type",
            required: false,
          },
        ],
      });

      notificationRecords.forEach((notif: any) => {
        const notifData = notif.toJSON ? notif.toJSON() : notif;
        notificationsMap.set(notif.id, notifData);
      });
    } catch (error: any) {
      // Fallback without notification_type if error
      if (error.name === 'SequelizeDatabaseError' && (error.message.includes('notification_type') || error.message.includes('Unknown column'))) {
        const notificationRecords = await NotificationsModel.findAll({
          where: {
            id: notificationIds
          }
        });
        notificationRecords.forEach((notif: any) => {
          const notifData = notif.toJSON ? notif.toJSON() : notif;
          notificationsMap.set(notif.id, { ...notifData, notification_type: null });
        });
      } else {
        throw error;
      }
    }
  }

  // Map notifications with batch-loaded data
  const enriched = result.data.map((n: any) => {
    const {
      push_token,
      created_by,
      updated_by,
      created_at,
      updated_at,
      notification_id,
      ...rest
    } = n.toJSON ? n.toJSON() : n;

    const notification = notificationsMap.get(notification_id);
    
    return {
      ...rest,
      notification_id,
      title: notification?.title || null,
      message: notification?.message || null,
      data_payload: notification?.data_payload || null,
      notification_type: notification?.notification_type || null,
    };
  });

  ctx.body = {
    data: enriched,
    pagination: result.pagination
  };
};

// User → mark as read
export const markAsRead = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const id = parseInt(ctx.params.id);
  await UserNotificationsRepo.markUserNotificationRead(id, userId);
  ctx.body = { status: "success" };
};

// User → mark all as read (optionally filter by notification_type_id)
export const markAllAsRead = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  const notification_type_id = ctx.request.body?.notification_type_id 
    ? parseInt(ctx.request.body.notification_type_id) 
    : undefined;

  const updatedCount = await UserNotificationsRepo.markUserNotificationReadAll(
    userId,
    notification_type_id
  );

  ctx.body = { 
    status: "success", 
    message: notification_type_id 
      ? `Marked all notifications of type ${notification_type_id} as read`
      : "Marked all notifications as read",
    updatedCount: updatedCount
  };
};
