import { Context } from 'koa';
import * as ApproverService from '../services/approverService';

export const getAllApprovers = async (ctx: Context) => {
    try {
        const approvers = await ApproverService.getAllApprovers()
        ctx.status = 200
        ctx.body = { approvers }
    } catch (error: any) {
        ctx.status = 500
        ctx.body = { error: error.message }
    }
}

export const getApproverByUserId = async (ctx: Context) => {
    try {
        const userId = parseInt(ctx.params.user_id)
        if (isNaN(userId)) {
            ctx.status = 400
            ctx.body = { error: 'Invalid user_id' }
            return
        }

        const approver = await ApproverService.getApproverByUserId(userId)
        if (!approver) {
            ctx.status = 404
            ctx.body = { error: 'Approver not found' }
            return
        }

        ctx.status = 200
        ctx.body = { approver }
    } catch (error: any) {
        ctx.status = 500
        ctx.body = { error: error.message }
    }
}

export const createApprover = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id
        const approverData = ctx.request.body

        const newApprover = await ApproverService.createApprover(approverData, userId)
        ctx.status = 201
        ctx.body = {
            message: 'Approver created',
            approver: newApprover
        }
    } catch (error: any) {
        ctx.status = 400
        ctx.body = { error: error.message }
    }
}

export const updateApprover = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id)
        const userId = ctx.state.user?.id
        const data = ctx.request.body

        const updated = await ApproverService.updateApprover(id, userId, data)
        ctx.status = 200
        ctx.body = {
            message: 'Approver updated',
            approver: updated
        }
    } catch (error: any) {
        ctx.status = 400
        ctx.body = { error: error.message }
    }
}

export const deactiveApprover = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id)
        const userId = ctx.state.user?.id

        const result = await ApproverService.deactiveApprover(id, userId)
        ctx.status = 200
        ctx.body = {
            message: 'Approver deactivated',
            approver: result
        }
    } catch (error: any) {
        ctx.status = 400
        ctx.body = { error: error.message }
    }
}

export const createApproverFromUser = async (ctx: Context) => {
    try {
        const { user_id } = ctx.request.body;
        const adminId = ctx.state.user?.id;

        if (!user_id || !adminId) {
            ctx.status = 400;
            ctx.body = { error: 'Missing user_id or unauthorized' };
            return;
        }

        const newApprover = await ApproverService.createApproverFromUser(user_id, adminId);

        ctx.status = 201;
        ctx.body = {
            message: 'Approver created successfully from user',
            approver: newApprover,
        };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};
