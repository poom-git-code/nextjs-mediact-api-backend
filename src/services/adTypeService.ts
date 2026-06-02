import AdTypeModel from "../models/AdTypeModel";

export const getAllAdsType = async () => {
    return await AdTypeModel.findAll({
        order: [["id", "ASC"]],
        attributes: ["id", "name", "description", "is_active"],
    });
};

export const getAdTypeById = async (id: number) => {
    return await AdTypeModel.findByPk(id);
};

export const createAdType = async (data: any, userId: number) => {
    return await AdTypeModel.create({
        ...data,
        created_by: userId,
        updated_by: userId,
    });
};

export const updateAdType = async (id: number, updates: any, userId: number) => {
    const ad_type = await AdTypeModel.findByPk(id);
    if (!ad_type) throw new Error("Ad type not found");
    return await ad_type.update({ ...updates, updated_by: userId });
};

export const deleteAdType = async (id: number, userId: number) => {
    const ad_type = await AdTypeModel.findByPk(id);
    if (!ad_type) throw new Error("Ad type not found");
    return await ad_type.update({ is_active: false, updated_by: userId });
};