import { Context } from 'koa';
import Joi from 'joi';
import * as CreditLogsService from '../services/creditLogsService';
import {
    createCreditLogSchema,
    // updateCreditLogSchema,
    emailReportSchema
} from '../validations/creditLogsValidation';
import AdPartnerModel from '../models/AdPartnerModel';
import PartnerAddressModel from '../models/PartnerAddressModel';
import CreditModel from '../models/CreditsModel';
import { getRemainingCreditsByPartnerId } from '../services/creditService';

// Create a new credit log
export const createCreditLog = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        const validatedData = await createCreditLogSchema.validateAsync(ctx.request.body);
        const newLog = await CreditLogsService.createCreditLog(validatedData, userId);
        ctx.status = 201;
        ctx.body = { message: 'Credit log created successfully', log: newLog };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error?.details?.[0]?.message || error.message };
    }
};

// Update existing credit log
// export const updateCreditLog = async (ctx: Context) => {
//     try {
//         const logId = Number(ctx.params.id);
//         if (isNaN(logId)) throw new Error('Invalid credit log ID');

//         const validatedData = await updateCreditLogSchema.validateAsync(ctx.request.body);
//         const updatedLog = await CreditLogsService.updateCreditLog(logId, validatedData);
//         ctx.body = { message: 'Credit log updated successfully', log: updatedLog };
//     } catch (error: any) {
//         ctx.status = 400;
//         ctx.body = { error: error?.details?.[0]?.message || error.message };
//     }
// };

// Get a single credit log by ID
export const getCreditLogById = async (ctx: Context) => {
    try {
        const logId = parseInt(ctx.params.id);
        if (isNaN(logId)) throw new Error('Invalid credit log ID');

        const log = await CreditLogsService.getCreditLogById(logId);
        ctx.body = { log };
    } catch (error: any) {
        ctx.status = 404;
        ctx.body = { error: error.message };
    }
};

// Get logs by credit_id
export const getLogsByCreditId = async (ctx: Context) => {
    try {
        const creditId = parseInt(ctx.params.credit_id);
        if (isNaN(creditId)) throw new Error('Invalid credit ID');

        const logs = await CreditLogsService.getLogsByCreditId(creditId);
        ctx.body = { logs };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

export const getAllCreditLogs = async (ctx: Context) => {
    try {
        const logList = await CreditLogsService.getAllCreditLogs();
        ctx.body = { credit_logs: logList };
    } catch (error: unknown) {
        ctx.status = 500;
        ctx.body = { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
};

// Get credit transaction history (Running Balance) for a partner
export const getCreditHistoryByPartnerId = async (ctx: Context) => {
    try {
        const partnerId = parseInt(ctx.params.partner_id);
        if (isNaN(partnerId)) throw new Error('Invalid partner ID');

        const history = await CreditLogsService.getCreditTransactionHistoryByPartner(partnerId);

        ctx.body = {
            partner_id: partnerId,
            transaction_history: history,
        };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

export const getAdReportByPartner = async (ctx: Context) => {
    try {
        const partnerId = parseInt(ctx.params.partner_id)
        if (isNaN(partnerId)) throw new Error("Invalid partner ID")

        const adIdQuery = ctx.query.ad_id
        const adId = adIdQuery ? parseInt(adIdQuery.toString()) : undefined
        if (adIdQuery && (adId === undefined || isNaN(adId))) throw new Error("Invalid ad ID")

        const adReport = adId !== undefined
            ? await CreditLogsService.getAdReportByPartner(partnerId, adId)
            : await CreditLogsService.getAdReportByPartner(partnerId);

        const partner = await AdPartnerModel.findByPk(partnerId)
        const address = await PartnerAddressModel.findOne({
            where: {
                partner_id: partnerId,
                address_type_id: 4,
                is_active: true
            }
        })

        const creditSummary = await getRemainingCreditsByPartnerId(partnerId);

        ctx.body = {
            partner_id: partnerId,
            partner_name: partner?.partner_name ?? null,
            tax_id: partner?.tax_id ?? null,
            address: address,
            credit_summary: creditSummary,
            ad_id: adId ?? null,
            ad_report: adReport
        }
    } catch (error: any) {
        ctx.status = 400
        ctx.body = { error: error.message }
    }
}


/**
 * Controller to handle sending the report PDF via email
 */
export const sendReportEmail = async (ctx: Context) => {
    try {
        // Validate the request body
        const validatedData: CreditLogsService.EmailReportPayload =
            await emailReportSchema.validateAsync(ctx.request.body);

        // Call the service to send the email
        const result = await CreditLogsService.sendReportByEmail(validatedData);

        // Send success response
        ctx.status = 200;
        ctx.body = {
            message: 'Report email sent successfully',
            messageId: result.messageId
        };

    } catch (error: any) {
        ctx.status = 400;

        if (!error.isJoi) {
            console.error('Failed to send email:', error.message);
            ctx.status = 500;
        }

        ctx.body = { error: error?.details?.[0]?.message || error.message };
    }
};