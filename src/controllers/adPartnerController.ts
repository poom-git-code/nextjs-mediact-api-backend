import { Context } from "koa";
import * as AdPartnerService from "../services/adPartnerService";
import { createAdPartnerSchema, editAdPartnerSchema } from "../validations/adPartnerValidation";
import Joi from "joi";

export const createAdPartner = async (ctx: Context) => {
    const { error, value } = createAdPartnerSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    try {
        const userId = ctx.state.user?.id;
        const partner = await AdPartnerService.createAdPartner(value, userId);
        ctx.status = 201;
        ctx.body = { message: "Partner created successfully", partner };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const updateAdPartner = async (ctx: Context) => {
    const { id } = ctx.params;
    const { error, value } = editAdPartnerSchema.validate(ctx.request.body);
    if (error) {
        ctx.status = 400;
        ctx.body = { error: error.details[0].message };
        return;
    }

    try {
        const userId = ctx.state.user?.id
        const updatedAdPartner = await AdPartnerService.updateAdPartner(parseInt(id, 10), value, userId);
        ctx.body = { message: "Partner updated successfully", updatedAdPartner };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const deleteAdPartner = async (ctx: Context) => {
    try {
        const userId = ctx.state.user?.id;
        await AdPartnerService.deleteAdPartner(parseInt(ctx.params.id), userId);
        ctx.body = { message: "Account deactivated successfully" };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

export const getPartnerById = async (ctx: Context) => {
    const { id } = ctx.params;

    try {
        const partner = await AdPartnerService.getAdPartnerById(parseInt(id, 10));
        ctx.body = { partner }
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
};

// export const getAdPartnerInfo = async (ctx: Context) => {
//     const partnerId = ctx.state.partner.id;

//     try {
//         const partner = await AdPartnerService.getAdPartnerInfo(partnerId);
//         ctx.body = { partner }
//     } catch (error) {
//         ctx.status = 400;
//         if (error instanceof Joi.ValidationError) {
//             ctx.body = { error: error.details[0].message };
//         } else if (error instanceof Error) {
//             ctx.body = { error: error.message };
//         } else {
//             ctx.body = { error: "Unknown error occurred" };
//         }
//     }
// };

export const getAllAdPartner = async (ctx: Context) => {
    try {
        const partners = await AdPartnerService.getAllAdPartner();
        ctx.body = { partners };
    } catch (error) {
        ctx.status = 400;
        if (error instanceof Joi.ValidationError) {
            ctx.body = { error: error.details[0].message };
        } else if (error instanceof Error) {
            ctx.body = { error: error.message };
        } else {
            ctx.body = { error: "Unknown error occurred" };
        }
    }
}