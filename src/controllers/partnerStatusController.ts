import { Context } from "koa";
import * as PartnerStatusService from '../services/partnerStatusService';
import { createPartnerStatusSchema, updatePartnerStatusSchema } from "../validations/partnerStatusValidation";
import Joi from "joi";

export const createPartnerStatus = async (ctx: Context) => {
    try {
        const validatedData = await createPartnerStatusSchema.validateAsync(ctx.request.body);
        const userId = ctx.state.user?.id;
        const newStatus = await PartnerStatusService.createPartnerStatus(validatedData, userId);

        ctx.status = 201;
        ctx.body = {
            message: 'Partner status created successfully.',
            data: newStatus,
        };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else {
            ctx.body = { error: (error as Error).message };
        }
    }
};

export const getAllPartnerStatuses = async (ctx: Context) => {
    try {
        const statuses = await PartnerStatusService.getAllPartnerStatuses();
        ctx.body = {
            message: 'Partner statuses retrieved successfully.',
            data: statuses,
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: (error as Error).message };
    }
};

export const getPartnerStatusById = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const status = await PartnerStatusService.getPartnerStatusById(id);

        if (!status) {
            ctx.status = 404;
            ctx.body = { error: 'Partner status not found.' };
            return;
        }

        ctx.body = { data: status }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: (error as Error).message };
    }
};

export const updatePartnerStatus = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const validatedData = await updatePartnerStatusSchema.validateAsync(ctx.request.body);
        const userId = ctx.state.user?.id;
        const updatedStatus = await PartnerStatusService.updatePartnerStatus(id, validatedData, userId);

        if (!updatedStatus) {
            ctx.status = 404;
            ctx.body = { error: 'Partner status not found or could not be updated.' };
            return;
        }

        ctx.body = {
            message: 'Partner status updated successfully.',
            data: updatedStatus,
        };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else {
            ctx.body = { error: (error as Error).message };
        }
    }
};

export const deletePartnerStatus = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const userId = ctx.state.user?.id;
        const deleted = await PartnerStatusService.deletePartnerStatus(id, userId);

        if (!deleted) {
            ctx.status = 404;
            ctx.body = { error: 'Partner status not found or could not be deleted.' };
            return;
        }

        ctx.body = {
            message: 'Partner status deleted successfully.',
        };
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: (error as Error).message };
    }
};