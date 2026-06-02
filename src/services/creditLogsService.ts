import CreditModel from "../models/CreditsModel";
import { sequelize } from "../config/database";
import CreditLogModel from "../models/CreditLogsModel";
import Decimal from "decimal.js";
import { Op, QueryTypes, Transaction } from "sequelize";
import AdsModel from "../models/AdsModel";
import AdImpressionModel from "../models/AdImpressionsModel";
import AdClickModel from "../models/AdClicksModels";
import AdTargetModel from "../models/AdTargetsModel";

import nodemailer from 'nodemailer';
import mailgunTransport = require('nodemailer-mailgun-transport');

/**
 * Interface สำหรับข้อมูลที่จะส่งอีเมล
 */
export interface EmailReportPayload {
    to: string;       // อีเมลผู้รับ
    fileName: string; // ชื่อไฟล์ PDF ที่จะแนบ
    pdfData: string;  // PDF ที่ถูกเข้ารหัสเป็น Base64 Data URI จาก Client
    partnerName: string; // ชื่อ Partner (สำหรับหัวข้ออีเมล)
}

export const createCreditLog = async (
    data: {
        credit_id: number;
        reference_id: number | null;
        change: number;
        type: 'click' | 'impression' | 'refund' | 'topup' | 'adjustment';
        description: string;
    },
    userId: number,
    transaction?: Transaction
) => {
    const run = async (trx: Transaction) => {
        const credit = await CreditModel.findOne({
            where: { id: data.credit_id },
            transaction: trx,
        });

        if (!credit) {
            throw new Error('Credit not found');
        }

        const change = new Decimal(data.change);

        if (data.type === 'topup' || data.type === 'refund') {
            credit.total_credits = new Decimal(credit.total_credits).plus(change).toNumber();
        }
        // else if (data.type === 'click' || data.type === 'impression') {
        //     credit.used_credits = new Decimal(credit.used_credits).plus(change).toNumber();
        // } 
        else if (data.type === 'adjustment') {
            // 1. current total credits
            const currentTotal = new Decimal(credit.total_credits);

            // 2. ดึง topup ล่าสุด
            const latestTopup = await CreditLogModel.findOne({
                where: {
                    credit_id: data.credit_id,
                    type: 'topup',
                },
                order: [['created_at', 'DESC']],
                transaction: trx,
            });

            if (!latestTopup) {
                throw new Error('No topup record found to adjust');
            }

            const originalTopup = new Decimal(latestTopup.change);
            const correctTopup = new Decimal(data.change);

            // 3. คำนวณ adjustment
            const adjustment = correctTopup.minus(originalTopup); // บวกหรือลบก็ได้

            // 4. ปรับ total credit
            credit.total_credits = currentTotal.plus(adjustment).toNumber();

            // 5. บันทึก adjustment log
            data.change = adjustment.toNumber(); // ให้ log บันทึก adjustment ที่แท้จริง
        }

        credit.updated_by = userId;
        await credit.save({ transaction: trx });

        const newLog = await CreditLogModel.create(
            {
                ...data,
                created_by: userId,
                updated_by: userId,
            },
            { transaction: trx }
        );

        return newLog;
    };

    // ถ้ามี transaction ส่งเข้ามา ให้ใช้เลย ไม่ต้องเปิด transaction ใหม่
    if (transaction) {
        return await run(transaction);
    } else {
        return await sequelize.transaction(run);
    }
};

// Update existing credit log
// export const updateCreditLog = async (
//     id: number,
//     updates: {
//         credit_id?: number;
//         ad_id?: number | null;
//         ad_click_id?: number | null;
//         ad_impression_id?: number | null;
//         change?: number;
//         type?: 'click' | 'impression' | 'refund' | 'topup';
//         description?: string;
//         updated_by: number;
//     }
// ) => {
//     const log = await CreditLogModel.findByPk(id);
//     if (!log) {
//         throw new Error('Credit log not found');
//     }

//     Object.assign(log, updates);
//     await log.save();
//     return log;
// };

// Get credit log by ID
export const getCreditLogById = async (id: number) => {
    const log = await CreditLogModel.findByPk(id);
    if (!log) {
        throw new Error('Credit log not found');
    }
    return log;
};

// Get logs by credit_id (optional filter)
export const getLogsByCreditId = async (credit_id: number) => {
    return await CreditLogModel.findAll({
        where: { credit_id },
        order: [['created_at', 'DESC']],
    });
};

export const getAllCreditLogs = async () => {
    return await CreditLogModel.findAll();
};

interface CreditTransactionHistory {
    credit_log_id: number;
    date: Date;
    type: string;
    description: string | null;
    change: string;
    remaining_credit: string;
}

interface CreditTransactionSummary {
    total_click_cost: string;
    total_impression_cost: string;
    total_clicks: number;
    total_impressions: number;
}

export const getCreditTransactionHistoryByPartner = async (partnerId: number) => {
    // 1. หาว่า partner นี้มี credit_id อะไร
    const credit = await CreditModel.findOne({ where: { user_id: partnerId } });

    if (!credit) {
        throw new Error("No credit record found for this partner");
    }

    // 2. ดึง logs ของ credit_id นั้น (เรียงเวลา ascending)
    const logs = await CreditLogModel.findAll({
        where: { credit_id: credit.id },
        order: [["created_at", "ASC"]],
    });

    if (!logs || logs.length === 0) {
        return { history: [], summary: null };
    }

    // 3. คำนวณ Running Balance และ Summary
    const history: CreditTransactionHistory[] = [];
    let runningBalance = new Decimal(0);

    let totalClickCost = new Decimal(0);
    let totalImpressionCost = new Decimal(0);
    let totalClicks = 0;
    let totalImpressions = 0;

    for (const log of logs) {
        const changeAmount = new Decimal(log.change);

        // Summary สะสมยอดเฉพาะ click / impression
        if (log.type === "click") {
            totalClickCost = totalClickCost.plus(changeAmount);
            totalClicks += 1;
        }

        if (log.type === "impression") {
            totalImpressionCost = totalImpressionCost.plus(changeAmount);
            totalImpressions += 1;
        }

        // Running balance
        if (log.type === "topup" || log.type === "refund") {
            runningBalance = runningBalance.plus(changeAmount);
        } else {
            runningBalance = runningBalance.minus(changeAmount);
        }

        history.push({
            credit_log_id: log.id,
            date: log.created_at,
            type: log.type,
            description: log.description,
            change: changeAmount.toFixed(4),
            remaining_credit: runningBalance.toFixed(4),
        });
    }

    const summary: CreditTransactionSummary = {
        total_click_cost: totalClickCost.toFixed(4),
        total_impression_cost: totalImpressionCost.toFixed(4),
        total_clicks: totalClicks,
        total_impressions: totalImpressions,
    };

    return { history, summary };
};

interface AdTargetGroup {
    genders?: string[]
    age_ranges?: string[]
    occupations?: string[]
    locations?: string[]
}

interface AdReport {
    ad_id: number
    title: string
    status: string
    start_date: Date | null
    end_date: Date | null
    budget: number
    used_budgets: number
    cost_per_click: number
    cost_per_impression: number
    impressions: number
    clicks: number
    ctr: number
    reach: number
    frequency: number
    target: AdTargetGroup
}

export const getAdReportByPartner = async (
    partnerId: number,
    specificAdId?: number
): Promise<AdReport[]> => {
    // 1. ดึงโฆษณาของ partner (เลือกทั้งหมด หรือเฉพาะ ad_id ที่ระบุ)
    const ads = await AdsModel.findAll({
        where: {
            partner_id: partnerId,
            ...(specificAdId ? { id: specificAdId } : {})
        }
    })

    const report: AdReport[] = []

    for (const ad of ads) {
        // 2. นับ impressions, clicks, reach
        const [impressions, clicks, reachUsers] = await Promise.all([
            AdImpressionModel.count({ where: { ad_id: ad.id } }),
            AdClickModel.count({ where: { ad_id: ad.id } }),
            AdImpressionModel.count({
                where: {
                    ad_id: ad.id,
                    viewer_user_id: { [Op.not]: null }
                },
                distinct: true,
                col: 'viewer_user_id'
            })
        ])

        // 3. คำนวณ metric
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
        const frequency = reachUsers > 0 ? impressions / reachUsers : 0

        // 4. ดึง Target
        const targets = await AdTargetModel.findAll({ where: { ad_id: ad.id, is_active: true } })

        const groupedTarget: AdTargetGroup = {}
        for (const target of targets) {
            const key = target.target_type as keyof AdTargetGroup
            if (!groupedTarget[key]) {
                groupedTarget[key] = []
            }
            groupedTarget[key]!.push(target.target_value!)
        }

        // 5. รวมผลลัพธ์
        report.push({
            ad_id: ad.id,
            title: ad.title,
            status: ad.status,
            start_date: ad.start_date,
            end_date: ad.end_date,
            budget: ad.budget,
            used_budgets: ad.used_budgets,
            cost_per_click: ad.cost_per_click ?? 0,
            cost_per_impression: ad.cost_per_impression ?? 0,
            impressions,
            clicks,
            ctr: parseFloat(ctr.toFixed(2)),
            reach: reachUsers,
            frequency: parseFloat(frequency.toFixed(2)),
            target: groupedTarget
        })
    }

    return report
}

/**
 * Job กระทบยอด (Re-Sync)
 */
export const runDataSyncJob = async () => {
    console.log('Starting data sync job (V2)...');

    const transaction = await sequelize.transaction();

    try {
        console.log('Syncing ads.used_budgets based on actual impressions/clicks...');

        const syncAdsQuery = `
            UPDATE ads a
            LEFT JOIN (
                SELECT
                    ad_id,
                    COUNT(*) AS total_impressions
                FROM
                    ad_impressions
                GROUP BY
                    ad_id
            ) AS imp ON a.id = imp.ad_id
            LEFT JOIN (
                SELECT
                    ad_id,
                    COUNT(*) AS total_clicks
                FROM
                    ad_clicks
                GROUP BY
                    ad_id
            ) AS clk ON a.id = clk.ad_id
            SET
                a.used_budgets = 
                    (COALESCE(imp.total_impressions, 0) * COALESCE(a.cost_per_impression, 0)) +
                    (COALESCE(clk.total_clicks, 0) * COALESCE(a.cost_per_click, 0));
        `;

        const [, adMetadata]: [any, any] = await sequelize.query(syncAdsQuery, {
            transaction,
            type: QueryTypes.UPDATE,
        });

        const adRowsAffected = adMetadata.affectedRows ?? adMetadata.rowCount ?? 0;
        console.log(`Synced ads table. Rows affected: ${adRowsAffected}`);

        console.log('Syncing credits.allocated_credits based on ads.budget...');

        const syncCreditsQuery = `
            UPDATE credits c
            LEFT JOIN (
                SELECT
                    partner_id,
                    SUM(budget) AS correct_allocated
                FROM
                    ads  -- (ใช้ตาราง ads ที่เพิ่งอัปเดต)
                GROUP BY
                    partner_id
            ) AS summary ON c.user_id = summary.partner_id
            SET
                c.used_credits = COALESCE(summary.correct_allocated, 0);
        `;

        const [, creditMetadata]: [any, any] = await sequelize.query(syncCreditsQuery, {
            transaction,
            type: QueryTypes.UPDATE,
        });

        const creditRowsAffected = creditMetadata.affectedRows ?? creditMetadata.rowCount ?? 0;
        console.log(`Synced credits table. Rows affected: ${creditRowsAffected}`);

        console.log('Syncing ad statuses for over-budget ads...');

        const syncAdStatusQuery = `
            UPDATE ads
            SET
                status = 'inactive'
            WHERE
                used_budgets >= budget
                AND status = 'active';
        `;

        const [, statusMetadata]: [any, any] = await sequelize.query(syncAdStatusQuery, {
            transaction,
            type: QueryTypes.UPDATE,
        });

        const statusRowsAffected = statusMetadata.affectedRows ?? statusMetadata.rowCount ?? 0;
        console.log(`Deactivated over-budget ads. Rows affected: ${statusRowsAffected}`);

        await transaction.commit();
        console.log('Data sync job completed successfully!');

        return {
            success: true,
            syncedAds: adRowsAffected,
            syncedCredits: creditRowsAffected,
            deactivatedAds: statusRowsAffected,
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Data sync job failed:', error);
        throw error;
    }
};

/**
 * Service สำหรับส่งอีเมลพร้อมแนบไฟล์ PDF (ที่สร้างจาก Client)
 */
export const sendReportByEmail = async (payload: EmailReportPayload) => {
    const { to, fileName, pdfData, partnerName } = payload;

    // ตั้งค่า Transporter (ตัวส่งอีเมล)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: (process.env.EMAIL_PORT === '465'),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // แยกส่วน Base64 Data URI
    const base64Content = pdfData.split(';base64,').pop();

    if (!base64Content) {
        throw new Error("Invalid PDF data format. Expected Data URI string.");
    }

    const mailOptions = {
        from: `"MediAct Reports" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: to,
        subject: `Ad Performance Report for ${partnerName}`,
        html: `
                <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
                    <p>Dear ${partnerName} Team,</p>

                    <p>Your Ad Performance Report is ready and attached to this email.</p>

                    <p>This report includes a detailed breakdown of your campaign metrics (impressions, clicks, CTR) and a summary of your credit usage.</p>

                    <p>We hope these insights are helpful. Please let us know if you have any questions or would like to discuss these results.</p>

                    <p>Thank you for partnering with MediAct.</p>

                    <p>Best regards,<br>
                    The MediAct Team</p>
                </div>
            `,
        attachments: [
            {
                filename: fileName,
                content: base64Content,
                encoding: 'base64',
                contentType: 'application/pdf'
            }
        ]
    };

    // สั่งส่งอีเมล
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully: ' + info.messageId);
        return {
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        };
    } catch (error: any) {
        console.error('Error sending email via Nodemailer:', error);
        throw new Error('Failed to send email.');
    }
};

// export const sendReportByEmail = async (payload: EmailReportPayload) => {
//     const { to, fileName, pdfData, partnerName } = payload;

//     // [STEP 2: CHANGED] ตั้งค่า Transporter ให้ใช้ Mailgun
//     // ลบ Transporter แบบเก่า (host, port) ทิ้งไป
//     const mailgunOptions = {
//         auth: {
//             api_key: process.env.MAILGUN_API_KEY!, // ใช้เครื่องหมาย ! เพื่อยืนยันว่ามีค่า
//             domain: process.env.MAILGUN_DOMAIN!
//         }
//     };

//     // สร้าง Transporter ด้วย Mailgun
//     const transporter = nodemailer.createTransport(mailgunTransport(mailgunOptions));

//     // ---- ส่วนที่เหลือเหมือนเดิมทั้งหมด ----

//     // แยกส่วน Base64 Data URI
//     const base64Content = pdfData.split(';base64,').pop();

//     if (!base64Content) {
//         throw new Error("Invalid PDF data format. Expected Data URI string.");
//     }

//     const mailOptions = {
//         // ใช้ EMAIL_FROM_ADDRESS จาก .env ที่เราตั้งค่าใหม่
//         from: `"MediAct Reports" <${process.env.EMAIL_FROM_ADDRESS}>`,
//         to: to,
//         subject: `Ad Performance Report for ${partnerName}`,
//         html: `
//                 <div style="font-family: Arial, sans-serif; font-size: 15px; color: #222; line-height: 1.6;">
//                     <p>Dear ${partnerName} Team,</p>
    
//                     <p>Your Ad Performance Report is ready and attached to this email.</p>
    
//                     <p>This report includes a detailed breakdown of your campaign metrics (impressions, clicks, CTR) and a summary of your credit usage.</p>
    
//                     <p>We hope these insights are helpful. Please let us know if you have any questions or would like to discuss these results.</p>
    
//                     <p>Thank you for partnering with MediAct.</p>
    
//                     <p>Best regards,<br>
//                     The MediAct Team</p>
//                 </div>
//             `,
//         attachments: [
//             {
//                 filename: fileName,
//                 content: base64Content,
//                 encoding: 'base64',
//                 contentType: 'application/pdf'
//             }
//         ]
//     };

//     // สั่งส่งอีเมล (เหมือนเดิม)
//     try {
//         const info = await transporter.sendMail(mailOptions);
//         // แนะนำให้เปลี่ยน Console Log เพื่อให้รู้ว่าส่งผ่าน Mailgun แล้ว
//         console.log('Email sent successfully via Mailgun: ' + info.messageId);
//         return {
//             success: true,
//             message: 'Email sent successfully',
//             messageId: info.messageId
//         };
//     } catch (error: any) {
//         console.error('Error sending email via Mailgun:', error);
//         throw new Error('Failed to send email.');
//     }
// };