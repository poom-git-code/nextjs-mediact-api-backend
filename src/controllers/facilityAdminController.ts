import { Context } from "koa";
import * as FacilityAdminService from "../services/facilityAdminService";
import {
  createFacilityAdminSchema,
  updateFacilityAdminSchema,
  getFacilityAdminsByFacilitySchema,
  getFacilityAdminsByUserSchema,
} from "../validations/facilityAdminValidation";
import Joi from "joi/lib";

export const createFacilityAdmin = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createFacilityAdminSchema.validate(data);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const facilityAdmin = await FacilityAdminService.createFacilityAdmin(value, userId);
    ctx.body = { 
      message: "Facility admin assignment created successfully", 
      facilityAdmin 
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

export const updateFacilityAdmin = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;

  const { error, value } = updateFacilityAdminSchema.validate(updates);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const facilityAdmin = await FacilityAdminService.updateFacilityAdmin(
      parseInt(id),
      value,
      userId
    );
    ctx.body = { 
      message: "Facility admin assignment updated successfully", 
      facilityAdmin 
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

export const deleteFacilityAdmin = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await FacilityAdminService.deleteFacilityAdmin(parseInt(id));
    ctx.body = { message: "Facility admin assignment deleted successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getFacilityAdminById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const facilityAdmin = await FacilityAdminService.getFacilityAdminById(parseInt(id));
    ctx.body = { facilityAdmin };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAllFacilityAdmins = async (ctx: Context) => {
  try {
    const facilityAdmins = await FacilityAdminService.getAllFacilityAdmins();
    ctx.body = { 
      facilityAdmins,
      total: facilityAdmins.length
    };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getFacilityAdminsByFacility = async (ctx: Context) => {
  const { facility_id } = ctx.params;

  const { error } = getFacilityAdminsByFacilitySchema.validate({ 
    facility_id: parseInt(facility_id) 
  });
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const facilityAdmins = await FacilityAdminService.getFacilityAdminsByFacility(
      parseInt(facility_id)
    );
    ctx.body = { 
      facilityAdmins,
      total: facilityAdmins.length
    };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getFacilityAdminsByUser = async (ctx: Context) => {
  const { user_id } = ctx.params;

  const { error } = getFacilityAdminsByUserSchema.validate({ 
    user_id: parseInt(user_id) 
  });
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const facilityAdmins = await FacilityAdminService.getFacilityAdminsByUser(
      parseInt(user_id)
    );
    ctx.body = { 
      facilityAdmins,
      total: facilityAdmins.length
    };
  } catch (error) {
    ctx.status = 404;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getActiveFacilityAdmins = async (ctx: Context) => {
  try {
    const facilityAdmins = await FacilityAdminService.getActiveFacilityAdmins();
    ctx.body = { 
      facilityAdmins,
      total: facilityAdmins.length
    };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};
