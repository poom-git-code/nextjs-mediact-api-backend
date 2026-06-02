import PartnerTypeModel from "../models/PartnerTypeModel";

export const getAllPartnerType = async () => {
    return await PartnerTypeModel.findAll({
        order: [["id", "ASC"]],
        attributes: ["id", "name", "description", "is_active"],
    });
};

export const getPartnerTypeById = async (id: number) => {
    return await PartnerTypeModel.findByPk(id);
};

export const createPartnerType = async (data: any, userId: number) => {
    return await PartnerTypeModel.create({
        ...data,
        created_by: userId,
        updated_by: userId,
    });
};

export const updatePartnerType = async (id: number, updates: any, userId: number) => {
    const partner_type = await PartnerTypeModel.findByPk(id);
    if (!partner_type) throw new Error("Partner type not found");
    return await partner_type.update({ ...updates, updated_by: userId });
};

export const deletePartnerType = async (id: number, userId: number) => {
    const partner_type = await PartnerTypeModel.findByPk(id);
    if (!partner_type) throw new Error("Partner type not found");
    return await partner_type.update({ is_active: false, updated_by: userId });
};