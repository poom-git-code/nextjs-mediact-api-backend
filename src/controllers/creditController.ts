import { Context } from "koa";
import Joi from "joi";
import * as CreditService from "../services/creditService";
import {
  createCreditSchema,
  // deductCreditSchema,
  checkRemainingCreditsSchema,
} from "../validations/creditsValidation";

// Controller: Create or top-up credits
export const createCredits = async (ctx: Context) => {
  try {
    const { user_id, total_credits } = ctx.request.body;
    const userId = ctx.state.user?.id;

    const newCredit = await CreditService.createCredits(
      { user_id, total_credits },
      userId
    );

    ctx.body = { message: "Credits created successfully", credit: newCredit };
  } catch (error: unknown) {
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

// Controller: Deduct credits
// export const deductCredits = async (ctx: Context) => {
//   try {
//     const { user_id, credits_to_deduct, updated_by } = await deductCreditSchema.validateAsync(
//       ctx.request.body
//     );

//     const updatedCredit = await CreditService.deductCredits({
//       user_id,
//       credits_to_deduct,
//       updated_by,
//     });

//     ctx.body = {
//       message: "Credits deducted successfully",
//       credit: updatedCredit,
//     };
//   } catch (error: unknown) {
//     ctx.status = 400;
//     if (error instanceof Joi.ValidationError) {
//       ctx.body = { error: error.details[0].message };
//     } else if (error instanceof Error) {
//       ctx.body = { error: error.message };
//     } else {
//       ctx.body = { error: "Unknown error occurred" };
//     }
//   }
// };

// Controller: Check remaining credits with full details
export const checkRemainingCredits = async (ctx: Context) => {
  try {
    const { user_id } = await checkRemainingCreditsSchema.validateAsync(ctx.params);

    const creditInfo = await CreditService.getRemainingCredits(Number(user_id));

    ctx.body = {
      message: "Credit details fetched successfully",
      credit: creditInfo,
    };
  } catch (error: unknown) {
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


export const getAllCredits = async (ctx: Context) => {
  try {
    const creditList = await CreditService.getAllCredits();
    ctx.body = { credits: creditList };
  } catch (error: unknown) {
    ctx.status = 500;
    ctx.body = { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
};

export const getCreditById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id)
    if (isNaN(id)) {
      ctx.status = 400
      ctx.body = { error: 'Invalid credit ID' }
      return
    }

    const credit = await CreditService.getCreditById(id)

    ctx.status = 200
    ctx.body = { credit }
  } catch (error: any) {
    ctx.status = 404
    ctx.body = { error: error.message || 'Unable to fetch credit record' }
  }
}

export const getRemainingCreditByPartnerId = async (ctx: Context) => {
  try {
    const partnerIdParam = ctx.params.partner_id

    if (!partnerIdParam) {
      ctx.status = 400
      ctx.body = { error: "partner_id is required in URL parameter" }
      return
    }

    const partnerId = parseInt(partnerIdParam, 10)
    if (isNaN(partnerId)) {
      ctx.status = 400
      ctx.body = { error: "partner_id must be a number" }
      return
    }

    const result = await CreditService.getRemainingCreditsByPartnerId(partnerId)

    ctx.status = 200
    ctx.body = result
  } catch (error: any) {
    ctx.status = 500
    ctx.body = { error: error.message || "Internal server error" }
  }
}

export const updateAdBudget = async (ctx: Context) => {
  try {
    const {
      partner_id,
      ad_id,
      budget,
    } = ctx.request.body

    const userId = ctx.state.user.id

    if (
      partner_id === undefined ||
      ad_id === undefined ||
      budget === undefined
    ) {
      ctx.status = 400
      ctx.body = { error: "partner_id, ad_id and budget are required" }
      return
    }

    if (
      isNaN(partner_id) ||
      isNaN(ad_id) ||
      isNaN(budget)
    ) {
      ctx.status = 400
      ctx.body = { error: "partner_id, ad_id and budget must be numbers" }
      return
    }

    const result = await CreditService.updateAdBudget({
      partner_id: Number(partner_id),
      ad_id: Number(ad_id),
      budget: Number(budget),
      updated_by: Number(userId)
    })

    ctx.status = 200
    ctx.body = result
  } catch (error: any) {
    ctx.status = 500
    ctx.body = {
      error: error.message || "Internal server error"
    }
  }
}