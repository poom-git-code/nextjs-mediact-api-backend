import { Context } from "koa";
import * as AddressService from "../services/addressService";
import Joi from "joi";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validations/addressValidation";

export const createAddress = async (ctx: Context) => {
  const data = ctx.request.body;

  const { error, value } = createAddressSchema.validate(data);
  if (error) {
    ctx.status = 400;
    console.log("Validation error:", error);
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
    // Add created_by and updated_by
    const address = await AddressService.createAddress(
      { ...value, created_by: userId, updated_by: userId },
      userId
    );
    ctx.status = 201;
    ctx.body = { message: "Address created successfully", address };
  } catch (error) {
    ctx.status = 400;
    console.log("Validation error:", error);
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const createAddressMobile = async (ctx: Context) => {
  const data = ctx.request.body;

  // const { error, value } = createAddressSchema.validate(data);
  // if (error) {
  //   ctx.status = 400;
  //   console.log("Validation error:", error);
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const address = await AddressService.createAddressMobile(
      {
        ...data,
        province: data.province_name_en,
        district: data.district_name_en,
        sub_district: data.subdistrict_name_en,
      },
      userId
    );
    ctx.status = 201;
    ctx.body = { message: "Address created successfully", address };
  } catch (error) {
    ctx.status = 400;
    console.log("Validation error:", error); // Add this
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const updateAddress = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  // const { error, value } = updateAddressSchema.validate(updates);
  // if (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    // Add updated_by
    const updatedAddress = await AddressService.updateAddress(
      parseInt(id, 10),
      {
        ...updates,
        province: updates.province_name_en,
        district: updates.district_name_en,
        sub_district: updates.subdistrict_name_en,
        updated_by: userId,
      },
      userId
    );
    ctx.body = { message: "Address updated successfully", updatedAddress };
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

export const updateAddressMobile = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  // const { error, value } = updateAddressSchema.validate(updates);
  // if (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  console.log("Debugging updateAddressMobile - Request Body:", updates);

  const userId = ctx.state.user?.id;
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized: User ID not found in token" };
    return;
  }

  try {
    const updatedAddress = await AddressService.updateAddress(
      parseInt(id, 10),
      {
        ...updates,
        province: updates.province_name_en,
        district: updates.district_name_en,
        sub_district: updates.subdistrict_name_en,
      },
      userId
    );
    ctx.body = { message: "Address updated successfully", updatedAddress };
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

export const deleteAddress = async (ctx: Context) => {
  const userId = ctx.state.user.id;
  try {
    await AddressService.deleteAddress(Number(ctx.params.id), userId);
    ctx.body = { message: "Address deleted successfully" };
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

export const getAddressById = async (ctx: Context) => {
  try {
    const address = await AddressService.getAddressById(Number(ctx.params.id));
    ctx.body = { address };
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

export const getAddressByUserId = async (ctx: Context) => {
  try {
    const address = await AddressService.getAddressByUserId(
      Number(ctx.params.id)
    );
    ctx.body = { address };
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

export const getAllUserAddressInfo = async (ctx: Context) => {
  try {
    const userId = ctx.state.user.id;
    const address = await AddressService.getAllUserAddressInfo(userId);
    ctx.body = { address };
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

export const getAddressByUserIdManagement = async (ctx: Context) => {
  try {
    const address = await AddressService.getAddressByUserIdManagement(
      Number(ctx.params.id)
    );
    ctx.body = { address };
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

export const getAllAddresses = async (ctx: Context) => {
  try {
    const addresses = await AddressService.getAllAddresses();
    ctx.body = { addresses };
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

export const getAllAddressesManagement = async (ctx: Context) => {
  try {
    const addresses = await AddressService.getAllAddressesManagement();
    ctx.body = { addresses };
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
