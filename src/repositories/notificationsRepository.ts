// src/repositories/notifications.repository.ts
import Notifications from '../models/NotificationsModel';

export const createNotification = async (data: any) => {
  return await Notifications.create(data);
};

export const getNotificationById = async (id: number) => {
  return await Notifications.findByPk(id);
};

export const updateNotification = async (id: number, data: any) => {
  return await Notifications.update(data, {
    where: { id },
  });
};