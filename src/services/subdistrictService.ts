import SubdistrictModel from "../models/SubdistrictModel";

export const getAllSubdistricts = async () => {
  return await SubdistrictModel.findAll({ order: [["subdistrict_code", "ASC"]] });
};

export const getSubdistrictById = async (id: number) => {
  return await SubdistrictModel.findByPk(id);
};

export const getSubdistrictsByDistrictCode = async (district_code: number) => {
  return await SubdistrictModel.findAll({
    where: { district_code },
    order: [["subdistrict_code", "ASC"]],
  });
};

export const createSubdistrict = async (data: any, userId: number) => {
  return await SubdistrictModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateSubdistrict = async (id: number, updates: any, userId: number) => {
  const subdistrict = await SubdistrictModel.findByPk(id);
  if (!subdistrict) throw new Error("Subdistrict not found");
  return await subdistrict.update({ ...updates, updated_by: userId });
};

export const deleteSubdistrict = async (id: number, userId: number) => {
  const subdistrict = await SubdistrictModel.findByPk(id);
  if (!subdistrict) throw new Error("Subdistrict not found");
  return await subdistrict.destroy();
};