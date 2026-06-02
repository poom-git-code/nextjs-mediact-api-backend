// src/repositories/user_notifications.repository.ts
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import UserNotifications from '../models/UserNotificationsModel';
import { toLocalISOString } from '../utils/dateFormatter';

export const createUserNotification = async (data: any) => {
  return await UserNotifications.create(data);
};

export const getUserNotifications = async (userId: number) => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const allNotifications = await UserNotifications.findAll({
    where: {
      user_id: userId,
      push_status: 'success',
      created_at: {
        [Op.gte]: sixtyDaysAgo
      }
    },
    order: [['created_at', 'DESC'], ['id', 'ASC']]
  });

  const seenNotificationIds = new Set<number>();
  const uniqueNotifications = allNotifications.filter((notif: any) => {
    const data = notif.toJSON ? notif.toJSON() : notif;
    if (seenNotificationIds.has(data.notification_id)) {
      return false;
    }
    seenNotificationIds.add(data.notification_id);
    return true;
  });

  // return uniqueNotifications;
  return uniqueNotifications.map((notif: any) => {
    const data = notif.toJSON ? notif.toJSON() : notif;
    // if (data.created_at) {
    //   data.created_at = toLocalISOString(data.created_at);
    // }
    // if (data.updated_at) {
    //   data.updated_at = toLocalISOString(data.updated_at);
    // }
    if (data.sent_at) {
      data.sent_at = toLocalISOString(data.sent_at);
    }
    return data;
  });
};

export const getUserNotificationsWithPaging = async (
  userId: number,
  page: number = 1,
  limit: number = 10
) => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  // Filter 60 วันก่อนใน subquery เพื่อลด scope และเพิ่มความเร็ว
  const subquery = `(
    SELECT MIN(id) as min_id
    FROM user_notifications
    WHERE user_id = ${userId} 
      AND push_status = 'success'
      AND created_at >= '${sixtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ')}'
    GROUP BY notification_id
  )`;

  const offset = (page - 1) * limit;

  const { count, rows } = await UserNotifications.findAndCountAll({
    where: {
      id: {
        [Op.in]: sequelize.literal(subquery)
      },
      created_at: {
        [Op.gte]: sixtyDaysAgo
      }
    },
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  // Convert created_at and updated_at to ISO format
  const formattedRows = rows.map((notif: any) => {
    const data = notif.toJSON ? notif.toJSON() : notif;
    if (data.created_at) {
      data.created_at = toLocalISOString(data.created_at);
    }
    if (data.updated_at) {
      data.updated_at = toLocalISOString(data.updated_at);
    }
    return data;
  });

  return {
    data: formattedRows,
    // data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasMore: offset + rows.length < count
    }
  };
};

export const markUserNotificationRead = async (id: number, userId: number) => {
  return await UserNotifications.update(
    { is_read: true, read_at: new Date() },
    { where: { id, user_id: userId } }
  );
};

export const markUserNotificationReadAll = async (
  userId: number,
  notificationTypeId?: number
) => {
  if (!notificationTypeId) {
    const [updatedCount] = await UserNotifications.update(
      { is_read: true, read_at: new Date() },
      { 
        where: { 
          user_id: userId, 
          is_read: false 
        } 
      }
    );
    return updatedCount;
  }

  const query = `
    UPDATE user_notifications un
    INNER JOIN notifications n ON un.notification_id = n.id
    SET un.is_read = 1, un.read_at = NOW()
    WHERE un.user_id = :userId
      AND un.is_read = 0
      AND n.notification_type_id = :notificationTypeId
  `;

  const [results] = await sequelize.query(query, {
    replacements: { 
      userId, 
      notificationTypeId 
    },
    type: QueryTypes.UPDATE
  });

  // MySQL returns affectedRows as first element of results array
  return Array.isArray(results) ? results[0] : results;
};

export const updateUserNotificationStatus = async (
  notification_id: number,
  user_id: number,
  push_token: string | null,
  updateData: any
) => {
  return await UserNotifications.update(updateData, {
    where: {
      notification_id,
      user_id,
      push_token: push_token === null ? { [Op.is]: null } : push_token
    }
  });
};

/**
 * @param {any[]} data
 * @returns {Promise<UserNotifications[]>}
 */
export const bulkCreateUserNotifications = async (data: any[]) => {
  return await UserNotifications.bulkCreate(data)
}