// src/services/notificationTypes.service.ts
import NotificationTypesModel from "../models/NotificationTypesModel";

export const createNotificationType = async (data: {
  type_code: string;
  type_name_th: string;
  type_name_en: string;
  sequence?: number;
  is_active?: boolean;
}) => {
  return await NotificationTypesModel.create(data);
};

export const getAllNotificationTypes = async (includeInactive: boolean = false) => {
  const where = includeInactive ? {} : { is_active: true };
  return await NotificationTypesModel.findAll({
    where,
    order: [
      ["sequence", "ASC"],
      ["type_name_en", "ASC"],
    ],
  });
};

export const getNotificationTypeById = async (id: number) => {
  const notificationType = await NotificationTypesModel.findByPk(id);
  if (!notificationType) {
    throw new Error("Notification type not found");
  }
  return notificationType;
};

export const getNotificationTypeByCode = async (type_code: string) => {
  return await NotificationTypesModel.findOne({
    where: { type_code },
  });
};

export const updateNotificationType = async (
  id: number,
  updates: {
    type_code?: string;
    type_name_th?: string;
    type_name_en?: string;
    sequence?: number;
    is_active?: boolean;
  }
) => {
  const notificationType = await NotificationTypesModel.findByPk(id);
  if (!notificationType) {
    throw new Error("Notification type not found");
  }
  return await notificationType.update(updates);
};

export const deleteNotificationType = async (id: number) => {
  const notificationType = await NotificationTypesModel.findByPk(id);
  if (!notificationType) {
    throw new Error("Notification type not found");
  }
  await notificationType.destroy();
  return notificationType;
};

export const toggleNotificationTypeStatus = async (id: number) => {
  const notificationType = await NotificationTypesModel.findByPk(id);
  if (!notificationType) {
    throw new Error("Notification type not found");
  }
  return await notificationType.update({
    is_active: !notificationType.is_active,
  });
};
