import { Context } from "koa";
import * as PartnerAddressService from '../services/partnerAddressService';
import { createPartnerAddressSchema, updatePartnerAddressSchema } from "../validations/partnerAddressValidation";

export const createPartnerAddress = async (ctx: Context) => {
    try {
        const validateData = await createPartnerAddressSchema.validateAsync(ctx.request.body);
        const userId = ctx.state.user?.id;

        const newAddress = await PartnerAddressService.createPartnerAddress(validateData, userId);

        ctx.status = 201;
        ctx.body = {
            message: 'Partner address created successfully',
            data: newAddress,
        };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message }
    }
};

export const getAllPartnerAddresses = async (ctx: Context) => {
    const addresses = await PartnerAddressService.getAllPartnerAddresses();
    ctx.body = { data: addresses }
};

export const getPartnerAddressById = async (ctx: Context) => {
    const id = parseInt(ctx.params.id);
    const address = await PartnerAddressService.getPartnerAddressById(id);

    if (!address) {
        ctx.status = 400;
        ctx.body = { error: 'Partner address not found' };
        return;
    }

    ctx.body = { data: address }
};

export const getPartnerAddressByPartnerId = async (ctx: Context) => {
    const id = parseInt(ctx.params.id);
    const address = await PartnerAddressService.getPartnerAddressByPartnerId(id);

    if (!address) {
        ctx.status = 400;
        ctx.body = { error: 'Partner address not found' };
        return;
    }

    ctx.body = { data: address.data };

};

export const updatePartnerAddress = async (ctx: Context) => {
    try {
        const id = parseInt(ctx.params.id);
        const validateData = await updatePartnerAddressSchema.validateAsync(ctx.request.body);
        const userId = ctx.state.user?.id;

        const updated = await PartnerAddressService.updatePartnerAddress(id, validateData, userId);

        if (!updated) {
            ctx.status = 404;
            ctx.body = { error: 'Partner address not found' };
            return;
        }

        ctx.body = {
            message: 'Partner address updated successfully',
            data: updated,
        };
    } catch (error: any) {
        ctx.status = 400;
        ctx.body = { error: error.message }
    }
};

export const deletePartnerAddress = async (ctx: Context) => {
    const id = parseInt(ctx.params.id);
    const userId = ctx.state.user?.id;
    const deleted = await PartnerAddressService.deletePartnerAddress(id, userId);

    if (!deleted) {
        ctx.status = 404;
        ctx.body = { error: 'Partner address not found' };
        return;
    }

    ctx.body = { message: 'Partner address deleted successfully' };
};