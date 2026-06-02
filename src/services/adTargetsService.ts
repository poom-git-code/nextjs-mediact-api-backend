import AdTargetModel from '../models/AdTargetsModel';

// Create new ad target
export const createAdTarget = async (data: any, userId: number) => {
    return await AdTargetModel.create({
        ...data,
        created_by: userId,
        updated_by: userId
    });
};

// Get ad target by ID
export const getAdTargetById = async (id: number) => {
    const target = await AdTargetModel.findByPk(id);
    if (!target) {
        throw new Error('Ad target not found');
    }
    return target;
};

// Get all ad targets by ad ID
export const getAdTargetsByAdId = async (adId: number) => {
    return await AdTargetModel.findAll({ where: { ad_id: adId } });
};

// Update ad target
export const updateAdTarget = async (id: number, data: any, userId: number) => {
    const target = await AdTargetModel.findByPk(id);
    if (!target) {
        throw new Error('Ad target not found');
    }
    await target.update({
        ...data,
        updated_by: userId
    });
    return target;
};

export const getAllAdTarget = async () => {
    return await AdTargetModel.findAll();
};

export const deleteAdTarget = async (id: number, userId: number) => {
    const target = await AdTargetModel.findByPk(id);
    if (!target) throw new Error('Ad media not found.');
    return await target.update({
        is_active: false,
        updated_by: userId,
    });
}
