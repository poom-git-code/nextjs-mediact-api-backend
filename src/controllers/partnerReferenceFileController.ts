import { Context } from "koa";
import * as PartnerReferenceFileService from '../services/partnerReferenceFilesService';
import {
    createPartnerReferenceFileSchema,
    updatePartnerReferenceFileSchema
} from "../validations/partnerReferenceFilesValidation";

export const createPartnerReferenceFile = async (ctx: Context) => {
    try {
        const validatedData = await createPartnerReferenceFileSchema.validateAsync(ctx.request.body);
        const userId = ctx.state.user?.id;

        const newFile = await PartnerReferenceFileService.createPartnerReferenceFile(validatedData, userId);

        ctx.status = 201;
        ctx.body = {
            message: 'Partner reference file created successfully',
            data: newFile,
        };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

export const getAllPartnerReferenceFiles = async (ctx: Context) => {
    const files = await PartnerReferenceFileService.getAllPartnerReferenceFiles();
    ctx.body = { data: files };
};

export const getPartnerReferenceFileById = async (ctx: Context) => {
    const id = parseInt(ctx.params.id);
    const file = await PartnerReferenceFileService.getPartnerReferenceFileById(id);

    if (!file) {
        ctx.status = 404;
        ctx.body = { error: 'Partner reference file not found' };
        return;
    }

    ctx.body = { data: file };
};

export const updatePartnerReferenceFile = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const validatedData = await updatePartnerReferenceFileSchema.validateAsync(ctx.request.body);
        const userId = ctx.state.user?.id;

        const updatedFile = await PartnerReferenceFileService.updatePartnerReferenceFile(id, validatedData, userId);
        ctx.body = { message: 'Partner reference file updated successfully', data: updatedFile };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

export const deletePartnerReferenceFile = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const userId = ctx.state.user?.id;

        const deletedFile = await PartnerReferenceFileService.deletePartnerReferenceFile(id, userId);
        ctx.body = { message: 'Partner reference file deleted (soft delete)', data: deletedFile };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message };
    }
};

export const getPartnerReferenceFileByPartnerId = async (ctx: Context) => {
    const id = parseInt(ctx.params.id);
    const address = await PartnerReferenceFileService.getPartnerReferenceFileByPartnerId(id);

    if (!address) {
        ctx.status = 400;
        ctx.body = { error: 'Partner address not found' };
        return;
    }

    ctx.body = { data: address.data };

};