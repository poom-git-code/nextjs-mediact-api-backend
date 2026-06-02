import ApproverModel from '../models/ApproverModel';
import CreditApprovalLogModel from '../models/CreditApprovalLogModel';
import { Transaction } from 'sequelize';

export const createApprovalLog = async (
    data: {
        credit_log_id: number | null;
        status: 'approved' | 'rejected';
        remark?: string;
    },
    userId: number,
    transaction?: Transaction
) => {

    // Validate ว่า approver มีจริง
    const approver = await ApproverModel.findOne({
        where: { user_id: userId },
        transaction,
    });

    if (!approver) {
        // console.log('[DEBUG] Approver not found for userId:', userId);
        throw new Error('Approver not found');
    }

    const approvalLog = await CreditApprovalLogModel.create(
        {
            credit_log_id: data.credit_log_id,
            approver_id: approver.id,
            status: data.status,
            remark: data.remark || null,
            approved_at: new Date(),
            created_by: userId,
            updated_by: userId,
        },
        { transaction }
    );

    return approvalLog;
};

export const getApprovalLogsByCreditLogId = async (credit_log_id: number) => {
    return await CreditApprovalLogModel.findAll({
        where: { credit_log_id },
        order: [['approved_at', 'DESC']],
    });
};

export const getAllApprovalLogs = async () => {
    return await CreditApprovalLogModel.findAll({
        order: [['approved_at', 'DESC']],
    });
};