import AdsModel from "../models/AdsModel";
import { sequelize } from "../config/database";
import AdClickModel from "../models/AdClicksModels";
import CreditModel from "../models/CreditsModel";
import CreditLogModel from "../models/CreditLogsModel";
import Decimal from "decimal.js";
import AdMediaModel from "../models/AdMediaModel";
import { Op } from "sequelize";

export const createAdClickWithCreditLog = async (
    input: {
        // ad_id: number;
        ad_media_id?: number | null;
        viewer_ip?: string | null;
        viewer_user_id?: number | null;
    },
    userId: number
) => {
    return await sequelize.transaction(async (transaction) => {
        // ดึง ad_media และตามด้วย ad
        const media = await AdMediaModel.findOne({
            where: { id: input.ad_media_id },
            include: [{ model: AdsModel, as: 'ad' }],
            transaction,
        });

        if (!media || !media.ad) {
            throw new Error('Ad media or related ad not found');
        }

        const ad = media.ad;

        // หยุดทันทีถ้าโฆษณาถูกปิด
        if (ad.status === 'inactive') {
            throw new Error('This ad is inactive and cannot be clicked');
        }

        const now = new Date();
        if ((ad.start_date && ad.start_date > now) || (ad.end_date && ad.end_date < now)) {
            throw new Error("This ad is outside its valid date range");
        }

        // ตรวจสอบว่า user นี้ได้คลิก ad นี้แล้วในวันนี้หรือยัง
        if (userId) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const existingClick = await AdClickModel.findOne({
                where: {
                    viewer_user_id: userId,
                    ad_media_id: media.id,
                    created_at: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                },
                transaction,
            });

            if (existingClick) {
                // ถ้าเคยคลิกแล้วในวันนี้ จะไม่บันทึกซ้ำ
                // console.log(`Viewer ${userId} has already seen ad ${media.id} today.`);
                return existingClick;
            }
        }

        // if (userId) {
        //     const nowForCheck = new Date();
        //     // คำนวณเวลา 5 นาทีก่อนหน้า
        //     // (5 นาที * 60 วินาที * 1000 มิลลิวินาที)
        //     const fiveMinutesAgo = new Date(nowForCheck.getTime() - 5 * 60 * 1000);

        //     const existingImpression = await AdClickModel.findOne({
        //         where: {
        //             viewer_user_id: userId,
        //             ad_media_id: media.id,
        //             created_at: {
        //                 // ตรวจสอบว่ามี impression ในช่วง 5 นาทีที่ผ่านมาหรือไม่
        //                 [Op.between]: [fiveMinutesAgo, nowForCheck],
        //             },
        //         },
        //         transaction,
        //     });

        //     if (existingImpression) {
        //         // ถ้าเคยดูแล้วใน 5 นาทีนี้ จะไม่บันทึกซ้ำ
        //         // console.log(`Viewer ${userId} has already seen ad ${media.id} in the last 5 minutes.`);
        //         return existingImpression;
        //     }
        // }

        // สร้าง AdClick
        const adClick = await AdClickModel.create(
            {
                ad_id: ad.id,
                ad_media_id: media.id,
                viewer_ip: input.viewer_ip ?? null,
                viewer_user_id: userId,
                created_by: userId,
                updated_by: userId,
            },
            { transaction }
        );

        // หาค่าเครดิตของเจ้าของโฆษณา
        const credit = await CreditModel.findOne({
            where: { user_id: ad.partner_id },
            transaction,
        });

        if (!credit) {
            throw new Error('Credit record not found for this partner');
        }

        // เพิ่ม CreditLog (ประเภท click)
        const cost = new Decimal(ad.cost_per_click ?? 0);
        if (cost.lessThan(0)) {
            throw new Error("Invalid cost per click");
        }

        const credits = new Decimal(credit.total_credits);
        const used_credit = new Decimal(credit.used_credits);
        const remaining_credits = credits.minus(used_credit).toNumber();
        if (credits.lessThan(cost)) {
            throw new Error("Insufficient credit balance");
        }

        const budget = new Decimal(ad.budget);
        const used_budget = new Decimal(ad.used_budgets);
        const remaining_budgets = budget.minus(used_budget);
        if (remaining_budgets.lessThan(cost)) {
            throw new Error("Insufficient budget balance");
        }

        await CreditLogModel.create(
            {
                credit_id: credit.id,
                reference_id: adClick.id,
                change: cost,
                type: 'click',
                description: `Click on ad ${ad.id}`,
                created_by: userId,
                updated_by: userId,
            },
            { transaction }
        );

        // หักเครดิต
        const used_credits = new Decimal(credit.used_credits);
        const used_budgets = new Decimal(ad.used_budgets);
        const change = new Decimal(cost);

        // credit.used_credits = used_credits.plus(change).toNumber();
        ad.used_budgets = used_budgets.plus(change).toNumber();
        // credit.updated_by = userId;
        ad.updated_by = userId;
        try {
            // await credit.save({ transaction });
            await ad.save({ transaction });
        } catch (err) {
            throw new Error(`Failed to save updates: ${err}`);
        }

        // เช็คว่าใช้เครดิตถึงงบ budget หรือยัง
        if (ad.budget !== null && ad.used_budgets >= ad.budget) {
            ad.status = 'inactive'; // ปิดโฆษณา
            ad.updated_by = userId;
            await ad.save({ transaction });
        }

        return adClick;
    });
};

// Get all ad clicks
export const getAllAdClicks = async () => {
    return await AdClickModel.findAll();
};

// Get ad click by ID
export const getAdClickById = async (id: number) => {
    const adClick = await AdClickModel.findByPk(id);
    if (!adClick) {
        throw new Error('Ad click not found');
    }
    return adClick;
};

// // Update ad click by ID
// export const updateAdClick = async (id: number, data: any) => {
//     const adClick = await AdClickModel.findByPk(id);
//     if (!adClick) {
//         throw new Error('Ad click not found');
//     }

//     await adClick.update(data);
//     return adClick;
// };
