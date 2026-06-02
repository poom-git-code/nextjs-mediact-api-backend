import ProvinceModel from "../models/ProvinceModel";

export const getAllProvinces = async () => {
  return await ProvinceModel.findAll({ order: [["province_code", "ASC"]] });
};

export const getProvinceById = async (id: number) => {
  return await ProvinceModel.findByPk(id);
};

export const createProvince = async (data: any, userId: number) => {
  return await ProvinceModel.create({
    ...data,
    created_by: userId,
    updated_by: userId,
  });
};

export const updateProvince = async (id: number, updates: any, userId: number) => {
  const province = await ProvinceModel.findByPk(id);
  if (!province) throw new Error("Province not found");
  return await province.update({ ...updates, updated_by: userId });
};

export const deleteProvince = async (id: number, userId: number) => {
  const province = await ProvinceModel.findByPk(id);
  if (!province) throw new Error("Province not found");
  // ถ้าไม่ต้องการลบจริง อาจจะเพิ่ม field is_active แล้ว update เป็น false
  return await province.destroy();
};