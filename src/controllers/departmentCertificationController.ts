import { Context } from "koa";
import * as DepartmentCertificationService from "../services/departmentCertificationService";
import { addDeptCertSchema } from "../validations/departmentCertificationValidation";
import Joi from "joi";

/**
 * Controller สำหรับดึง Certifications ทั้งหมดของ Department
 * GET /partner/departments/:department_id/certifications
 */
export const getCertificationsForDepartment = async (ctx: Context) => {
  try {
    const { department_id } = ctx.params;

    if (!department_id) {
      ctx.status = 400;
      ctx.body = { error: "Department ID is missing from params." };
      return;
    }

    const certifications =
      await DepartmentCertificationService.getCertificationsForDepartment(
        Number(department_id)
      );

    ctx.status = 200;
    ctx.body = { certifications };
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
 * Controller สำหรับผูก Certification เข้ากับ Department
 * POST /partner/departments/:department_id/certifications
 */
export const addCertificationToDepartment = async (ctx: Context) => {
  try {
    const { department_id } = ctx.params;
    const created_by = ctx.state.user.id;

    // Validate body
    const { error, value } = addDeptCertSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { error: error.details[0].message };
      return;
    }

    const { certification_id } = value;

    if (!department_id || !created_by) {
      ctx.status = 400;
      ctx.body = { error: "Department ID or User ID is missing." };
      return;
    }

    const link =
      await DepartmentCertificationService.addCertificationToDepartment(
        Number(department_id),
        certification_id,
        created_by
      );

    ctx.status = 201; // Created
    ctx.body = {
      message: "Certification added to department successfully.",
      link,
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
 * Controller สำหรับลบ Certification ออกจาก Department
 * DELETE /partner/departments/:department_id/certifications/:certification_id
 */
export const removeCertificationFromDepartment = async (ctx: Context) => {
  try {
    const { department_id, certification_id } = ctx.params;

    if (!department_id || !certification_id) {
      ctx.status = 400;
      ctx.body = {
        error: "Department ID or Certification ID is missing from params.",
      };
      return;
    }

    const result =
      await DepartmentCertificationService.removeCertificationFromDepartment(
        Number(department_id),
        Number(certification_id)
      );

    ctx.status = 200;
    ctx.body = result;
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
