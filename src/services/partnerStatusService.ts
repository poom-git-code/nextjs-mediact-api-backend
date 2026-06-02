import { PartnerStatusModel } from "../models/PartnerStatusModel";

export const getAllPartnerStatuses = async () => {
    return await PartnerStatusModel.findAll({
        order: [['id', 'ASC']],
    });
};

export const getPartnerStatusById = async (id: number) => {
    return await PartnerStatusModel.findOne({
        where: { id }
    });
};

export const createPartnerStatus = async (data: any, userId: number) => {
    return await PartnerStatusModel.create({
        ...data,
        is_active: true,
        created_by: userId,
        updated_by: userId,
    });
};

export const updatePartnerStatus = async (
    id: number,
    data: any,
    userId: number
) => {
    const status = await PartnerStatusModel.findByPk(id);
    if (!status) throw new Error('Partner status not found');

    await status.update({
        ...data,
        updated_by: userId,
    });

    return status;
};

export const deletePartnerStatus = async (id: number, userId: number) => {
    const status = await PartnerStatusModel.findByPk(id);
    if (!status) throw new Error('Partner status not found');

    await status.update({
        is_active: false,
        updated_by: userId,
    });

    return status;
}