import { Context } from "koa";
import * as UserEmploymentService from "../services/userEmploymentService";
import * as UserService from "../services/userService";
import * as RoleService from "../services/roleService";
import {
  createUserEmploymentSchema,
  updateUserEmploymentSchema,
} from "../validations/userEmploymentValidation";
import Joi from "joi/lib";
import { getRoleById } from "./roleController";

export const createEmployment = async (ctx: Context) => {
  const { error, value } = createUserEmploymentSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    // Step 1: Fetch user data in order to get role_id
    const userData = await UserService.getUserById(value.user_id); // Adjust to your actual service
    if (!userData) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Step 2: Get role name using role_id
    // const role = await RoleService.getRoleById(userData.user_role?.role_id!);
    // const roleName = role.name;

    const employment = await UserEmploymentService.createEmployment({
      ...value,
      position_id: null,
      created_by: userId,
      updated_by: userId,
    });
    ctx.body = { message: "Employment created successfully", employment };
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

export const updateEmployment = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = updateUserEmploymentSchema.validate(
    ctx.request.body
  );
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { error: "Unauthorized" };
      return;
    }

    // Step 1: Fetch user data in order to get role_id
    // const userData = await UserService.getUserById(id); // Adjust to your actual service
    // if (!userData) {
    //   ctx.status = 404;
    //   ctx.body = { error: "User not found" };
    //   return;
    // }

    // Step 2: Get role name using role_id
    // const role = await RoleService.getRoleById(userData.user_role?.role_id!);
    // const roleName = role.name;

    const updatedEmployment = await UserEmploymentService.updateEmployment(
      parseInt(id, 10),
      {
        ...value,
        position_id: null,
        updated_by: userId,
      }
    );
    ctx.body = {
      message: "Employment updated successfully",
      updatedEmployment,
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

export const deleteEmployment = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await UserEmploymentService.deleteEmployment(parseInt(id, 10));
    ctx.body = { message: "Employment deleted successfully" };
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

export const getEmploymentById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const employment = await UserEmploymentService.getEmploymentById(
      parseInt(id, 10)
    );
    ctx.body = { employment };
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

export const getEmploymentsByUser = async (ctx: Context) => {
  const { user_id } = ctx.params;

  try {
    const employments = await UserEmploymentService.getEmploymentsByUser(
      parseInt(user_id, 10)
    );
    ctx.body = { employments };
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

export const getAllEmployments = async (ctx: Context) => {
  try {
    const employments = await UserEmploymentService.getAllEmployments();
    ctx.body = { employments };
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

export const getJobAudience = async (ctx: Context) => {
  console.log('--- DEBUG: Entered getJobAudience Controller ---');

  const {
    departmentId: departmentIdQuery,
    publishGroup,
    experienceRange,
    requiredRoleId: requiredRoleIdQuery
  } = ctx.request.query as {
    departmentId?: string;
    publishGroup?: 'hospital' | 'part-time' | 'system';
    experienceRange?: string;
    requiredRoleId?: string;
  };

  const { page: pageQuery, limit: limitQuery, searchQuery } = ctx.request.query as {
    page?: string;
    limit?: string;
    searchQuery?: string;
  };


  const schema = Joi.object({
    departmentId: Joi.number().required(),
    publishGroup: Joi.string().valid('hospital', 'part-time', 'system').required(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    searchQuery: Joi.string().allow('').optional(),
    experienceRange: Joi.string().allow('', null).optional(),
    requiredRoleId: Joi.number().integer().optional().allow(null),
  });

  const departmentId = departmentIdQuery ? parseInt(departmentIdQuery, 10) : undefined;
  const page = pageQuery ? parseInt(pageQuery, 10) : undefined;
  const limit = limitQuery ? parseInt(limitQuery, 10) : undefined;
  const requiredRoleId = requiredRoleIdQuery ? parseInt(requiredRoleIdQuery, 10) : undefined;

  const { error, value } = schema.validate({
    departmentId,
    publishGroup,
    page,
    limit,
    searchQuery,
    experienceRange,
    requiredRoleId
  });

  if (error || !value) {
    ctx.status = 400;
    ctx.body = { error: error ? error.details[0].message : 'Invalid input' };
    return;
  }

  const options = {
    page: value.page,
    limit: value.limit,
    searchQuery: value.searchQuery,
    experienceRange: value.experienceRange,
    requiredRoleId: value.requiredRoleId
  };

  console.log(`[Controller] getJobAudience called with departmentId: ${value.departmentId}, publishGroup: ${value.publishGroup}, experienceRange: ${value.experienceRange}`, options);

  try {
    const result = await UserEmploymentService.getAudienceByPublishGroup(
      value.departmentId,
      value.publishGroup,
      options
    );

    ctx.body = result;

  } catch (err) {
    console.error(`[Controller] Error in getJobAudience:`, err);
    ctx.status = (err as any).status || 500;
    ctx.body = { error: err instanceof Error ? err.message : 'An unexpected error occurred' };
  }
};