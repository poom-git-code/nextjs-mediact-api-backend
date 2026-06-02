import { Context } from "koa";
import * as UserExperienceService from "../services/userExperienceService";
import CategoryMasterModel from "../models/CategoryMasterModel";
import SubCategoryMasterModel from "../models/SubCategoryMasterModel";
import {
  createUserExperienceSchema,
  updateUserExperienceSchema,
  getUserExperiencesSchema,
} from "../validations/userExperienceValidation";
import Joi from "joi/lib";

export const createUserExperience = async (ctx: Context) => {
  const { error, value } = createUserExperienceSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    // prefer user id from token when available
    const tokenUserId = ctx.state.user?.id;
    if (!value.user_id && tokenUserId) value.user_id = tokenUserId;

    const experience = await UserExperienceService.createUserExperience(value as any);
    // attach category/subcategory if provided
    let experienceData: any = experience.get ? experience.get({ plain: true }) : experience;
    if (experienceData.category_master_id) {
      const cat = await CategoryMasterModel.findByPk(Number(experienceData.category_master_id));
      if (cat) experienceData.category = cat.get({ plain: true });
    }
    if (experienceData.sub_category_master_id) {
      const sub = await SubCategoryMasterModel.findByPk(Number(experienceData.sub_category_master_id));
      if (sub) experienceData.sub_category = sub.get({ plain: true });
    }

    ctx.status = 201;
    ctx.body = { message: "User experience created successfully", experience: experienceData };
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

export const getUserExperiences = async (ctx: Context) => {
  const { user_id } = ctx.query;
  const currentUserId = ctx.state.user?.id;

  try {
    let experiences;
    if (user_id) {
      // Get experiences for specific user
      experiences = await UserExperienceService.getUserExperiences(
        parseInt(user_id as string, 10)
      );
    } else if (currentUserId) {
      // Get experiences for current logged-in user
      experiences = await UserExperienceService.getUserExperiences(
        currentUserId
      );
    } else {
      ctx.status = 400;
      ctx.body = { error: "User ID is required" };
      return;
    }

    // attach category/subcategory for each experience if present
    const enriched = await Promise.all((experiences || []).map(async (exp: any) => {
      const e = { ...exp };
      if (e.category_master_id) {
        const cat = await CategoryMasterModel.findByPk(Number(e.category_master_id));
        if (cat) e.category = cat.get({ plain: true });
      }
      if (e.sub_category_master_id) {
        const sub = await SubCategoryMasterModel.findByPk(Number(e.sub_category_master_id));
        if (sub) e.sub_category = sub.get({ plain: true });
      }
      return e;
    }));

    ctx.body = { experiences: enriched };
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

export const getUserExperienceById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const experience = await UserExperienceService.getUserExperienceById(
      parseInt(id, 10)
    );
    ctx.body = { experience };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const updateUserExperience = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateUserExperienceSchema.validate(
    ctx.request.body
  );

  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedExperience = await UserExperienceService.updateUserExperience(
      parseInt(id, 10),
      value,
      ctx.state.user?.id
    );
    // attach category/subcategory to updated result
    let experienceData: any = updatedExperience.get ? updatedExperience.get({ plain: true }) : updatedExperience;
    if (experienceData.category_master_id) {
      const cat = await (await import('../models/CategoryMasterModel')).default.findByPk(Number(experienceData.category_master_id));
      if (cat) experienceData.category = cat.get({ plain: true });
    }
    if (experienceData.sub_category_master_id) {
      const sub = await (await import('../models/SubCategoryMasterModel')).default.findByPk(Number(experienceData.sub_category_master_id));
      if (sub) experienceData.sub_category = sub.get({ plain: true });
    }

    ctx.body = {
      message: "User experience updated successfully",
      experience: experienceData,
    };
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

export const deleteUserExperience = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await UserExperienceService.deleteUserExperience(parseInt(id, 10));
    ctx.body = { message: "User experience deleted successfully" };
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

export const getAllUserExperiences = async (ctx: Context) => {
  try {
    const experiences = await UserExperienceService.getAllUserExperiences();

    const enriched = await Promise.all((experiences || []).map(async (exp: any) => {
      const e = { ...exp };
      if (e.category_master_id) {
        const cat = await CategoryMasterModel.findByPk(Number(e.category_master_id));
        if (cat) e.category = cat.get({ plain: true });
      }
      if (e.sub_category_master_id) {
        const sub = await SubCategoryMasterModel.findByPk(Number(e.sub_category_master_id));
        if (sub) e.sub_category = sub.get({ plain: true });
      }
      return e;
    }));

    ctx.body = { experiences: enriched };
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

/**
 * @description Get paginated experiences for a specific applicant (user).
 */
export const getApplicantExperiencesController = async (ctx: Context) => {
  try {
    const { userId } = ctx.params;
    const { page, limit } = ctx.query;

    const options: { page?: number; limit?: number } = {};

    if (page) {
      options.page = parseInt(page as string, 10);
    }
    if (limit) {
      options.limit = parseInt(limit as string, 10);
    }

    const result = await UserExperienceService.getApplicantExperiences(
      parseInt(userId, 10),
      options
    );

    ctx.body = result;
    ctx.status = 200;

  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      if (error.message.includes("not found")) {
        ctx.status = 404;
      }
      ctx.body = { error: error.message };
    } else {
      ctx.status = 500;
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};