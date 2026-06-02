import { sequelize } from '../config/database';
import CreditRequestModel from '../models/CreditRequestModel';
import CreditModel from '../models/CreditsModel';
import CreditLogModel from '../models/CreditLogsModel';
import { Op } from 'sequelize';
import Decimal from 'decimal.js';
import * as CreditApprovalLogService from './creditApprovalLogService';
import * as CreditLogsService from './creditLogsService';
import AdPartnerModel from '../models/AdPartnerModel';

// สร้างคำขอเติมเครดิต
export const createCreditRequest = async (
    data: {
        credit_id: number;
        amount: number;
        request_type: 'topup' | 'adjustment';
        // requested_by: number;
        remark?: string;
    },
    userId: number
) => {
    return await CreditRequestModel.create({
        ...data,
        status: 'pending',
        requested_by: userId,
        created_by: userId,
        updated_by: userId,
        requested_at: new Date(),
    });
};

// อนุมัติคำขอเติมเครดิต
export const approveCreditRequest = async (
    requestId: number,
    userId: number
) => {
    try {
        return await sequelize.transaction(async (transaction) => {
            // console.log('[DEBUG] ก่อนหาคำขอ');
            const request = await CreditRequestModel.findOne({
                where: { id: requestId, status: 'pending' },
                transaction,
            });
            // console.log('[DEBUG] request:', request?.id);

            if (!request) {
                throw new Error('Credit request not found or already processed');
            }

            // console.log('[DEBUG] ก่อนสร้าง credit log');
            const creditLog = await CreditLogsService.createCreditLog(
                {
                    credit_id: request.credit_id,
                    reference_id: null,
                    change: request.amount,
                    type: request.request_type === 'adjustment' ? 'adjustment' : request.request_type,
                    description: `Top-up approved via request #${request.id}`,
                },
                userId,
                transaction
            );
            // console.log('[DEBUG] creditLog:', creditLog?.id);

            request.status = 'approved';
            request.approved_by = userId;
            request.approved_at = new Date();
            request.credit_log_id = creditLog.id;
            request.updated_by = userId;
            await request.save({ transaction });

            await CreditApprovalLogService.createApprovalLog(
                {
                    credit_log_id: creditLog.id,
                    status: 'approved',
                    remark: `Approved via credit request #${request.id}`,
                },
                userId,
                transaction
            );

            return {
                message: 'Credit request approved',
                request,
                creditLog,
            };
        });
    } catch (err) {
        console.error('[ERROR] approveCreditRequest:', err);
        throw err;
    }
};


// ปฏิเสธคำขอ
export const rejectCreditRequest = async (
    requestId: number,
    userId: number,
) => {
    return await sequelize.transaction(async (transaction) => {
        const request = await CreditRequestModel.findOne({
            where: {
                id: requestId,
                status: 'pending',
            },
            transaction,
        });

        if (!request) {
            throw new Error('Credit request not found or already processed');
        }

        request.status = 'rejected';
        request.approved_by = userId;
        request.approved_at = new Date();
        request.updated_by = userId;

        await request.save({ transaction });

        // เพิ่ม credit_approval_log
        await CreditApprovalLogService.createApprovalLog(
            {
                credit_log_id: null,
                status: 'rejected',
                remark: `Rejected via credit request #${request.id}`,
            },
            userId,
            transaction
        );


        return request
    });
};

// ดึงคำขอเครดิตทั้งหมด
export const getAllCreditRequests = async () => {
    const requests = await CreditRequestModel.findAll({
        include: [
            {
                model: CreditModel,
                as: 'credit',
                attributes: ['id', 'user_id', 'total_credits', 'used_credits'],
                include: [
                    {
                        model: AdPartnerModel,
                        as: 'partner',
                        attributes: ['partner_name'],
                    },
                ],
            },
            {
                model: CreditLogModel,
                as: 'credit_log',
                attributes: ['id', 'change', 'type', 'description', 'created_at'],
            },
        ],
        order: [['requested_at', 'DESC']],
    });

    return requests.map((request) => ({
        id: request.id,
        credit_id: request.credit_id,
        credit_log_id: request.credit_log_id,
        amount: request.amount,
        request_type: request.request_type,
        status: request.status,
        requested_by: request.requested_by,
        approved_by: request.approved_by,
        requested_at: request.requested_at,
        approved_at: request.approved_at,
        remark: request.remark,
        created_by: request.created_by,
        updated_by: request.updated_by,
        created_at: request.created_at,
        updated_at: request.updated_at,
        credit: {
            id: request.credit?.id,
            user_id: request.credit?.user_id,
            total_credits: request.credit?.total_credits,
            used_credits: request.credit?.used_credits,
            partner_name: request.credit?.partner?.partner_name || null,
        },
        credit_log: request.credit_log || null,
    }));
};