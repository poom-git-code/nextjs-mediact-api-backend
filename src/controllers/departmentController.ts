import { Context } from "koa";
import * as DepartmentService from "../services/departmentService";
import Joi from "joi/lib";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validations/departmentValidation";

export const createDepartment = async (ctx: Context) => {
  const data = ctx.request.body;

  // // Validate input
  // const { error, value } = createDepartmentSchema.validate(data);
  // if (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  try {
    const createdByUserId = ctx.state.user.id;
    const department = await DepartmentService.createDepartment(
      data,
      parseInt(createdByUserId, 10)
    );
    ctx.body = { message: "Department created successfully", department };
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

export const createPartnerDepartment = async (ctx: Context) => {
  const data = ctx.request.body;

  // // Validate input
  // const { error, value } = createDepartmentSchema.validate(data);
  // if (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: error.details[0].message };
  //   return;
  // }

  try {
    const createdByUserId = ctx.state.user.id;
    const department = await DepartmentService.createPartnerDepartment(
      data,
      parseInt(createdByUserId, 10)
    );
    ctx.body = { message: "Department created successfully", department };
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

export const updateDepartment = async (ctx: Context) => {
  const { id } = ctx.params;
  const updates = ctx.request.body;
  const updatedByUserId = ctx.state.user.id;

  // Validate input
  const { error, value } = updateDepartmentSchema.validate(updates);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const updatedDepartment = await DepartmentService.updateDepartment(
      parseInt(id, 10),
      value,
      parseInt(updatedByUserId, 10)
    );
    ctx.body = {
      message: "Department updated successfully",
      updatedDepartment,
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

export const deleteDepartment = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    await DepartmentService.deleteDepartment(parseInt(id, 10));
    ctx.body = { message: "Department deleted successfully" };
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

export const getDepartmentById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const department = await DepartmentService.getDepartmentById(
      parseInt(id, 10)
    );
    ctx.body = { department };
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

export const getAllDepartments = async (ctx: Context) => {
  try {
    const departments = await DepartmentService.getAllDepartments();
    ctx.body = { departments };
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

export const getDepartmentByFacilityId = async (ctx: Context) => {
  try {
    const { facility_id } = ctx.params;

    const { page, pageSize, search } = ctx.query;

    if (!facility_id || isNaN(Number(facility_id))) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: "BAD_REQUEST",
        message: "facility_id is required and must be a number.",
      };
      return;
    }

    const pageNum = page ? parseInt(page as string, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize as string, 10) : 25;
    const searchQuery = search as string | undefined;

    const result = await DepartmentService.getDepartmentByFacility(
      Number(facility_id),
      pageNum,
      pageSizeNum,
      searchQuery
    );

    ctx.status = 200;
    ctx.body = { success: true, ...result };
  } catch (error) {
    console.error("Error in getDepartmentByFacility controller:", error);
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { success: false, error: error.message };
    } else {
      ctx.body = { success: false, error: "Unknown error occurred" };
    }
  }
};

export const getPartnerDepartmentByFacility = async (ctx: Context) => {
  const userId = ctx.state.user.id as number;

  const {
    searchQuery,
    page: pageQuery,
    limit: limitQuery,
  } = ctx.request.query as {
    searchQuery?: string;
    page?: string;
    limit?: string;
  };

  const pageNum = pageQuery ? parseInt(pageQuery, 10) : undefined;
  const limitNum = limitQuery ? parseInt(limitQuery, 10) : undefined;

  const options = {
    searchQuery: searchQuery,
    page: pageNum && !isNaN(pageNum) ? pageNum : undefined,
    limit: limitNum && !isNaN(limitNum) ? limitNum : undefined,
  };

  console.log(
    `[Controller] getPartnerDepartmentByFacility called with userId: ${userId}, options:`,
    options
  );

  try {
    const serviceResult =
      await DepartmentService.getPartnerDepartmentByFacility(userId, options);

    console.log(
      `[Controller] Departments returned from service: ${serviceResult.data.length} items`
    );

    ctx.body = {
      departments: serviceResult.data,
      pagination: serviceResult.pagination,
    };
  } catch (error) {
    console.error(
      `[Controller] Error in getPartnerDepartmentByFacility:`,
      error
    );
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

export const getPartnerDepartmentByFacilityId = async (ctx: Context) => {
  const { facility_id } = ctx.params;
  console.log(`Fetching partner departments for facility ID: ${facility_id}`);
  // const userId = ctx.state.user.id;

  try {
    const departments =
      await DepartmentService.getPartnerDepartmentByFacilityId(
        parseInt(facility_id, 10)
      );
    ctx.body = { departments };
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

// export const getDepartmentByFacilityId = async (ctx: Context) => {
//   const { facility_id } = ctx.params;

//   try {
//     const departments = await DepartmentService.getDepartmentByFacilityId(parseInt(facility_id, 10));
//     ctx.body = { departments: departments };
//   } catch (error) {
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

export const getDepartmentsBySupervisor = async (ctx: Context) => {
  const userId = ctx.state.user.id;

  try {
    const departments = await DepartmentService.getDepartmentsBySupervisor(
      parseInt(userId, 10)
    );
    ctx.body = {
      message: "Departments retrieved successfully",
      departments: departments,
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

export const getDepartmentByIdWithDetails = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const department = await DepartmentService.getDepartmentByIdWithDetails(
      parseInt(id, 10)
    );
    ctx.body = {
      message: "Department retrieved successfully",
      department: department,
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

/**
 * Controller สำหรับดึงรายชื่อ Department (id, name) สำหรับ Dropdown
 * โดยกรองตาม Facility ของ User ที่ Login อยู่
 */
export const getDepartmentsForDropdownController = async (ctx: Context) => {
  const userId = ctx.state.user?.id as number | undefined;

  if (!userId) {
    console.error("[Controller] ERROR - User ID not found in ctx.state.user");
    ctx.status = 401;
    ctx.body = { error: "User not authenticated or user ID missing." };
    return;
  }

  const {
    searchQuery,
    page: pageQuery,
    limit: limitQuery,
  } = ctx.request.query as {
    searchQuery?: string;
    page?: string;
    limit?: string;
  };

  const schema = Joi.object({
    searchQuery: Joi.string().allow("").optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
  });

  const pageNum = pageQuery ? parseInt(pageQuery, 10) : undefined;
  const limitNum = limitQuery ? parseInt(limitQuery, 10) : undefined;

  const { error, value } = schema.validate({
    searchQuery: searchQuery,
    page: pageNum,
    limit: limitNum,
  });

  if (error) {
    console.error(`[Controller] Validation error:`, error.details[0].message);
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  const options = {
    searchQuery: value.searchQuery,
    page: value.page,
    limit: value.limit,
  };

  console.log(
    `[Controller] getDepartmentsForDropdown called with userId: ${userId}, options:`,
    options
  );

  try {
    const serviceResult = await DepartmentService.getDepartmentsForDropdown(
      userId,
      options
    );

    console.log(
      `[Controller] Departments returned from service: ${serviceResult.departments.length} items`
    );

    ctx.status = 200;
    ctx.body = serviceResult;
  } catch (err) {
    console.error(`[Controller] Error in getDepartmentsForDropdown:`, err);
    ctx.status = 500;
    ctx.body = {
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while fetching departments.",
    };
  }
};

export const removeMemberFromDepartment = async (ctx: Context) => {
  // รับ id (departmentId) และ userId จาก URL params
  // Route: DELETE /partner/departments/:id/members/:userId
  const { id, userId } = ctx.params;
  const updatedBy = ctx.state.user?.id; // จาก Middleware

  if (!id || !userId) {
    ctx.status = 400;
    ctx.body = { error: "Department ID and User ID are required" };
    return;
  }

  try {
    await DepartmentService.removeMemberFromDepartment(
      Number(id),
      Number(userId),
      updatedBy
    );

    ctx.status = 200;
    ctx.body = { message: "Member removed from department successfully" };
  } catch (error) {
    console.error("Remove member error:", error);
    ctx.status = 400;
    if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};
