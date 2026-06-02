import GenderModel from "../models/GenderModel";

export const getAllGenders = async () => {
  return await GenderModel.findAll({
    where: { is_active: true },
    order: [["id", "ASC"]],
    attributes: ["id", "name"],
  });
};

export const getGenderById = async (id: number) => {
  return await GenderModel.findByPk(id);
};

export const createGender = async (data: any, userId: number) => {
  return await GenderModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateGender = async (id: number, updates: any, userId: number) => {
  const gender = await GenderModel.findByPk(id);
  if (!gender) throw new Error("Gender not found");
  return await gender.update({ ...updates, updated_by: userId });
};

export const deleteGender = async (id: number, userId: number) => {
  const gender = await GenderModel.findByPk(id);
  if (!gender) throw new Error("Gender not found");
  return await gender.update({ is_active: false, updated_by: userId });
};