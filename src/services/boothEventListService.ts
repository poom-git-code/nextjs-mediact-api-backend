import BoothEventListModel from "../models/BoothListModel";
import { sequelize } from "../config/database";

export const createBoothEventList = async (
  data: Partial<BoothEventListModel>,
  userId: number
) => {
  return await BoothEventListModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateBoothEventList = async (
  id: number,
  updates: Partial<BoothEventListModel>,
  userId: number
) => {
  const booth = await BoothEventListModel.findByPk(id);
  if (!booth) throw new Error("Booth not found");
  return await booth.update({
    ...updates,
    updated_by: userId,
  });
};

export const deleteBoothEventList = async (id: number, userId: number) => {
  const deleted = await BoothEventListModel.destroy({
    where: { id },
  });

  if (!deleted) throw new Error("Booth not found");
  return true;
};

// List By booth_event_id
export const getBoothListByEventId = async (booth_event_id: number) => {
  const booths = await BoothEventListModel.findAll({
    where: { booth_event_id },
  });
  return booths;
};

export const getBoothListByIsActive = async () => {
  return await BoothEventListModel.findAll({
    where: { is_active: true },
    order: [["updated_at", "DESC"]],
  });
};

export const getAllBoothEventLists = async () => {
  return await BoothEventListModel.findAll({
    where: { is_active: true },
    order: [["updated_at", "DESC"]],
  });
};

export const getAllBoothEventListsManagement = async () => {
  return await BoothEventListModel.findAll({
    order: [["updated_at", "DESC"]],
  });
};
