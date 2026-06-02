import DistrictModel from "../models/DistrictModel";

export const getAllDistricts = async () => {
  return await DistrictModel.findAll({ order: [["district_code", "ASC"]] });
};

export const getDistrictById = async (id: number) => {
  return await DistrictModel.findByPk(id);
};

export const getDistrictsByProvinceCode = async (province_code: number) => {
  return await DistrictModel.findAll({
    where: { province_code },
    order: [["district_code", "ASC"]],
  });
};

export const createDistrict = async (data: any, userId: number) => {
  return await DistrictModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateDistrict = async (id: number, updates: any, userId: number) => {
  const district = await DistrictModel.findByPk(id);
  if (!district) throw new Error("District not found");
  return await district.update({ ...updates, updated_by: userId });
};

export const deleteDistrict = async (id: number, userId: number) => {
  const district = await DistrictModel.findByPk(id);
  if (!district) throw new Error("District not found");
  return await district.destroy();
};