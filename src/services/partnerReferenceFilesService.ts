import AdPartnerModel from "../models/AdPartnerModel";
import PartnerReferenceFile from "../models/PartnerReferenceFilesModel";

export const createPartnerReferenceFile = async (data: any, userId: number) => {
    return await PartnerReferenceFile.create({
        ...data,
        created_by: userId,
        updated_by: userId,
    });
};

export const getAllPartnerReferenceFiles = async () => {
    return await PartnerReferenceFile.findAll();
};

export const getPartnerReferenceFileById = async (id: number) => {
    return await PartnerReferenceFile.findByPk(id);
};

export const getPartnerReferenceFileByPartnerId = async (partnerId: number) => {
    const files = await PartnerReferenceFile.findAll({
        where: { partner_id: partnerId },
        include: [
            {
                model: AdPartnerModel,
                as: "partner",
                attributes: ["partner_name"],
            },
        ],
        order: [
            ['is_active', 'DESC'],
        ],
    });

    const result = files.map((file) => ({
        id: file.id,
        file_name: file.file_name,
        file_url: file.file_url,
        is_active: file.is_active,
        created_by: file.created_by,
        updated_by: file.updated_by,
        created_at: file.created_at,
        updated_at: file.updated_at
    }));

    return { data: result };
};

export const updatePartnerReferenceFile = async (
    id: number,
    data: any,
    userId: number
) => {
    const file = await PartnerReferenceFile.findByPk(id);
    if (!file) throw new Error('Partner reference file not found');

    await file.update({
        ...data,
        updated_by: userId
    });
    return file;
};

export const deletePartnerReferenceFile = async (id: number, userId: number) => {
    const file = await PartnerReferenceFile.findByPk(id);
    if (!file) throw new Error('Partner reference file not found');

    await file.update({
        is_active: false,
        updated_by: userId
    });

    return file;
};