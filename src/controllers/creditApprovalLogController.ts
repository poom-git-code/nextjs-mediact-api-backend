import { Context } from 'koa';
import * as CreditApprovalLogService from '../services/creditApprovalLogService';

export const getAllApprovalLogs = async (ctx: Context) => {
    try {
        const logs = await CreditApprovalLogService.getAllApprovalLogs();
        ctx.status = 200;
        ctx.body = { logs };
    } catch (error: any) {
        ctx.status = 500;
        ctx.body = { error: error.message || 'Failed to fetch approval logs' };
    }
};

export const getApprovalLogsByCreditLogId = async (ctx: Context) => {
    try {
        const credit_log_id = parseInt(ctx.params.credit_log_id);

        if (isNaN(credit_log_id)) {
            ctx.status = 400;
            ctx.body = { error: 'Invalid credit_log_id' };
            return;
        }

        const logs = await CreditApprovalLogService.getApprovalLogsByCreditLogId(credit_log_id);
        ctx.status = 200;
        ctx.body = { logs };
    } catch (error: any) {
        ctx.status = 500;
        ctx.body = { error: error.message || 'Failed to fetch logs for the given credit_log_id' };
    }
};

export const createApprovalLog = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        if (!userId) {
            ctx.status = 401;
            ctx.body = { error: 'Unauthorized' };
            return;
        }

        const { credit_log_id, status, remark } = ctx.request.body;

        if (!credit_log_id || !['approved', 'rejected'].includes(status)) {
            ctx.status = 400;
            ctx.body = { error: 'credit_log_id and valid status (approved or rejected) are required' };
            return;
        };


        const approvalLog = await CreditApprovalLogService.createApprovalLog(
            { credit_log_id, status, remark },
            userId
        );

        ctx.status = 201;
        ctx.body = {
            message: 'Approval log created successfully',
            approvalLog
        };
    } catch (error: any) {
        ctx.status = 500;
        ctx.body = { error: error.message || 'Failed to create approval log' };
    }
};