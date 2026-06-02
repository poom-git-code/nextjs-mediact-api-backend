import { Context } from "koa";
import * as CertificationService from "../services/certificationService";

export const getAllCertifications = async (ctx: Context) => {
  ctx.body = {
    certifications: await CertificationService.getAllCertifications(),
  };
};

export const getCertificationById = async (ctx: Context) => {
  const cert = await CertificationService.getCertificationById(
    Number(ctx.params.id)
  );
  if (!cert) {
    ctx.status = 404;
    ctx.body = { error: "Certification not found" };
    return;
  }
  ctx.body = { certification: cert };
};

export const getAllUserCertifications = async (ctx: Context) => {
  const userId = ctx.state.user?.id;
  const cert = await CertificationService.getCertificationById(userId);
  if (!cert) {
    ctx.status = 404;
    ctx.body = { error: "Certification not found" };
    return;
  }
  ctx.body = { certification: cert };
};

export const getCertificationsByRoleId = async (ctx: Context) => {
  try {
    const userIdFromParams = ctx.params.id as string | undefined;
    const paramUserId = userIdFromParams ? Number(userIdFromParams) : null;

    let userId: number | null | undefined = paramUserId;

    if (userId === null || userId === undefined || isNaN(userId)) {
      ctx.status = 400;
      ctx.body = {
        error: "User ID not provided or invalid in URL parameter",
      };
      return;
    }

    const result = await CertificationService.getCertificationsByRoleId(userId);

    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: result,
    };
  } catch (error) {
    console.error("Error in getCertificationsByRoleId:", error);
    ctx.status = 500;
    ctx.body = {
      status: "error",
      message: (error as Error).message || "An unexpected error occurred",
    };
  }
};

export const getCertificationsByRole = async (ctx: Context) => {
  try {
    // ดึง userId จาก token (priority) หรือ query parameter
    const userIdFromToken = ctx.state.user?.id;
    const userIdQuery = ctx.query.userId as string | undefined;
    const queryUserId = userIdQuery ? Number(userIdQuery) : null;

    let userId: number | null | undefined = userIdFromToken || queryUserId;

    if (userId === null || userId === undefined || isNaN(userId)) {
      ctx.status = 400; // ใช้ 400 Bad Request เพราะ Input ไม่ถูกต้อง
      ctx.body = {
        error:
          "User ID not provided via token or invalid/missing in query parameter",
      };
      return;
    }

    const result = await CertificationService.getCertificationsByRole(userId);

    ctx.status = 200;
    ctx.body = {
      status: "success",
      data: result,
    };
  } catch (error) {
    console.error("Error in getCertificationsByRole:", error);
    ctx.status = 500;
    ctx.body = {
      status: "error",
      message: (error as Error).message || "An unexpected error occurred",
    };
  }
};

export const createCertification = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const cert = await CertificationService.createCertification(
      ctx.request.body,
      userId
    );
    ctx.body = { certification: cert };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const updateCertification = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    const cert = await CertificationService.updateCertification(
      Number(ctx.params.id),
      ctx.request.body,
      userId
    );
    ctx.body = { certification: cert };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};

export const deleteCertification = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await CertificationService.deleteCertification(
      Number(ctx.params.id),
      userId
    );
    ctx.body = { success: true };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: (error as Error).message };
  }
};
