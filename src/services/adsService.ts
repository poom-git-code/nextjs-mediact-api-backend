import { Op } from "sequelize";
import AdPartnerModel from "../models/AdPartnerModel";
import AdTypeModel from "../models/AdTypeModel";
import AdsModel from "../models/AdsModel";

export const createAd = async (data: any, userId: number) => {
    return await AdsModel.create({
        ...data,
        created_by: userId,
        updated_by: userId,
    });
};

export const updateAd = async (id: number, updates: Partial<AdsModel>, userId: number) => {
    const ad = await AdsModel.findByPk(id);
    if (!ad) {
        throw new Error("Ad not found");
    }

    return await ad.update({
        ...updates,
        updated_by: userId
    });
};

export const deleteAd = async (id: number, userId: number) => {
    const ad = await AdsModel.findByPk(id);
    if (!ad) {
        throw new Error("Ad not found");
    }
    return await ad.update({ status: "inactive", updated_by: userId });
};

export const getAdById = async (id: number) => {
    const ad = await AdsModel.findByPk(id, {
        include: [
            {
                model: AdTypeModel,
                as: "ad_type",
                attributes: ["name"]
            },
            {
                model: AdPartnerModel,
                as: "partner",
                attributes: ["partner_name"]
            },
        ],
    });

    if (!ad) {
        throw new Error("Ad not found");
    }

    return {
        id: ad.id,
        partner_id: ad.partner_id,
        partner: ad.partner?.partner_name || null,
        ad_type_id: ad.ad_type_id,
        ad_type: ad.ad_type?.name || null,
        url: ad.url,
        start_date: ad.start_date,
        end_date: ad.end_date,
        title: ad.title,
        content: ad.content,
        status: ad.status,
        budget: ad.budget,
        used_budgets: ad.used_budgets,
        cost_per_click: ad.cost_per_click,
        cost_per_impression: ad.cost_per_impression,
    };
};

export const getAllAds = async () => {
    const ads = await AdsModel.findAll({
        include: [
            {
                model: AdTypeModel,
                as: "ad_type",
                attributes: ["name"],
            },
            {
                model: AdPartnerModel,
                as: "partner",
                attributes: ["partner_name"],
            },
        ],
        order: [["created_at", "DESC"]]
    });

    return ads.map((ad) => ({
        id: ad.id,
        partner_id: ad.partner_id,
        partner: ad.partner?.partner_name || null,
        ad_type_id: ad.ad_type_id,
        ad_type: ad.ad_type?.name || null,
        url: ad.url,
        start_date: ad.start_date,
        end_date: ad.end_date,
        title: ad.title,
        content: ad.content,
        status: ad.status,
        budget: ad.budget,
        used_budgets: ad.used_budgets,
        cost_per_click: ad.cost_per_click,
        cost_per_impression: ad.cost_per_impression,
        created_by: ad.created_by,
        created_at: ad.created_at,
        updated_by: ad.updated_by,
        updated_at: ad.updated_at,
    }));
};


export const updateAdStatus = async (id: number) => {
    const ad = await AdsModel.findByPk(id);
    if (!ad) {
        throw new Error("Ad not found");
    }
    return await ad.update({ status: "inactive" });
};

// export const getAdInfo = async (id: number) => {
//     const ad = await AdsModel.findByPk(id, {
//         include: [
//             {
//                 model: AdTypeModel,
//                 as: "ad_type",
//                 attributes: ["name"]
//             },
//         ],
//     });

//     if (!ad) {
//         throw new Error("Ad not found");
//     }

//     return {
//         ad: {
//             id: ad.id,
//             partner_id: ad.partner_id,
//             partner: ad.partner,
//             ad_type: ad.ad_type,
//             url: ad.url,
//             start_date: ad.start_date,
//             end_date: ad.end_date,
//             title: ad.title,
//             content: ad.content,
//             status: ad.status,
//             budget: ad.budget,
//             used_budgets: ad.used_budgets,
//             cost_per_click: ad.cost_per_click,
//             cost_per_impression: ad.cost_per_impression,
//         },
//     };
// };

export const expiredOldAds = async () => {
    const now = new Date()
    await AdsModel.update(
        { status: "inactive" },
        {
            where: {
                end_date: { [Op.lt]: now },
                status: "active"
            }
        }
    )
}