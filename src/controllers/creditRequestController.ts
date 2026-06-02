import { Context } from 'koa';
import * as CreditRequestService from '../services/creditRequestService';
import { createCreditRequestSchema } from '../validations/creditRequestValidation';
import Joi from 'joi';

export const createCreditRequest = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        const validated = await createCreditRequestSchema.validateAsync(ctx.request.body);

        const request = await CreditRequestService.createCreditRequest(validated, userId);

        ctx.status = 201;
        ctx.body = {
            message: 'Credit request created successfully',
            request,
        };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error?.details?.[0]?.message || error.message };
    }
};

export const approveCreditRequest = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        const requestId = Number(ctx.params.id);

        // console.log('[DEBUG] approveCreditRequest userId:', userId, 'requestId:', requestId);

        const result = await CreditRequestService.approveCreditRequest(requestId, userId);
        ctx.status = 200;
        ctx.body = result;
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error?.message || 'An error occurred' };
    }
};

export const rejectCreditRequest = async (ctx: Context) => {
    try {
        const requestId = Number(ctx.params.id);
        const approverId = ctx.state.user?.id;

        const result = await CreditRequestService.rejectCreditRequest(requestId, approverId);

        ctx.status = 200;
        ctx.body = {
            message: 'Credit request rejected successfully',
            result,
        };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

export const getAllCreditRequests = async (ctx: Context) => {
    try {
        const requests = await CreditRequestService.getAllCreditRequests();
        ctx.status = 200;
        ctx.body = { requests };
    } catch (error: any) {
        ctx.status = 500;
        ctx.body = { error: error.message };
    }
};