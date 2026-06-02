import { Context } from "koa";
import * as UserDocumentService from "../services/UserDocumentService";
import {
  createUserDocumentSchema,
  updateUserDocumentSchema,
  getUserDocumentsQuerySchema,
} from "../validations/userDocumentValidation";
import * as fs from "fs";

import * as UploadService from "../services/uploadService";
import { addWatermark } from "../utils/watermark";
import { addPdfWatermark } from "../utils/watermarkpdf";
import config from "../config/config";
import path from "path";
import os from "os";

export const createUserDocument = async (ctx: Context) => {
  try {
    const { error, value } = createUserDocumentSchema.validate(
      ctx.request.body
    );
    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      };
      return;
    }
    const bodyUserId = value.user_id;
    const tokenUserId = ctx.state.user?.id;
    const userId = bodyUserId || tokenUserId;
    const result = await UserDocumentService.createUserDocument(
      { ...value, user_id: userId },
      userId
    );
    if (result.success) {
      ctx.status = 201;
      ctx.body = result;
    } else {
      ctx.status = 400;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

export const createUserDocumentWithFile = async (ctx: Context) => {
  try {
    const file = (ctx.request as any).files?.file;
    const data = ctx.request.body;
    const bodyUserId = data?.user_id ? Number(data.user_id) : null;
    const tokenUserId = ctx.state.user?.id;
    const userId = bodyUserId || tokenUserId;
    if (!userId || isNaN(userId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "User ID is required (either in body or token)",
      };
      return;
    }
    if (!file) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "File is required for document creation",
      };
      return;
    }
    const documentNumberFile = (ctx.request as any).files?.document_number;
    if (documentNumberFile && documentNumberFile.filepath) {
      try {
        const documentNumberContent = fs.readFileSync(
          documentNumberFile.filepath,
          "utf8"
        );
        data.document_number = documentNumberContent.trim();
        fs.unlink(documentNumberFile.filepath, (err: any) => {
          if (err)
            console.warn(
              "⚠️ Failed to delete document_number temp file:",
              err.message
            );
        });
      } catch (err) {
        console.warn(
          "⚠️ Failed to read document_number from MultipartFile:",
          err
        );
      }
    }
    const result = await UserDocumentService.createUserDocumentWithFile(
      data,
      file,
      userId
    );
    if (result.success) {
      ctx.status = 201;
      ctx.body = result;
    } else {
      ctx.status = 400;
      ctx.body = result;
    }
  } catch (error: any) {
    console.error("❌ Error in createUserDocumentWithFile:", error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

export const getUserDocuments = async (ctx: Context) => {
  try {
    const { error, value } = getUserDocumentsQuerySchema.validate(ctx.query);
    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      };
      return;
    }
    const result = await UserDocumentService.getUserDocuments(value);
    ctx.status = 200;
    ctx.body = result;
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};
export const getUserDocumentById = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid document ID",
      };
      return;
    }
    const result = await UserDocumentService.getUserDocumentById(id);
    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

export const updateUserDocument = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Invalid document ID" };
      return;
    }

    const file = (ctx.request as any).files?.file;
    const data = ctx.request.body;

    const tokenUserId = ctx.state.user?.id;
    const userIdToPass = tokenUserId || data.user_id;

    if (!userIdToPass || isNaN(userIdToPass)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "User ID is required (either in body or token)",
      };
      return;
    }

    if (file) {
      console.log(`🚀 Updating file for document ID: ${id}`);
      try {
        const filePath = file.filepath || file.path;
        const originalName =
          file.originalFilename || file.originalname || file.filename;
        const timestamp = Date.now();

        const nameWithExt = originalName || "";
        const lastDot = nameWithExt.lastIndexOf(".");
        if (lastDot === -1)
          throw new Error("Filename must include an extension.");
        const nameOfFile = nameWithExt.substring(0, lastDot);
        const extension = nameWithExt.substring(lastDot).toLowerCase();

        if (![".png", ".jpg", ".jpeg", ".webp", ".pdf"].includes(extension)) {
          throw new Error("Unsupported file type.");
        }

        let prefix = [".png", ".jpg", ".jpeg", ".webp"].includes(extension)
          ? "pictures"
          : "documents";

        const fileName = `${nameOfFile}_${timestamp}${extension}`;

        const key = `${userIdToPass}/${prefix}/${fileName}`;

        // (คัดลอก Logic การ Watermark มา)
        const watermarkPath = path.join(__dirname, "../assets/mediact.png");
        const watermarkedFilename = `watermarked-${timestamp}${extension}`;
        const watermarkedPath = path.join(os.tmpdir(), watermarkedFilename);

        if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
          await addWatermark(filePath, watermarkPath, watermarkedPath);
        } else if (extension === ".pdf") {
          await addPdfWatermark(filePath, watermarkedPath, "MediAct");
        }

        const uploadResult = await UploadService.uploadUserDataFileToSpace(
          watermarkedPath,
          key
        );

        data.file_url =
          uploadResult.Location ||
          `${config.spaces.endpoint}/${config.spaces.bucket_user_data}/${key}`;

        fs.unlink(filePath, (err: any) => {
          if (err) console.warn("Failed to delete original file:", err.message);
        });
        fs.unlink(watermarkedPath, (err: any) => {
          if (err)
            console.warn("Failed to delete watermarked file:", err.message);
        });
      } catch (err: any) {
        console.error("❌ Failed to upload new file during update:", err);
        ctx.status = 500;
        ctx.body = {
          success: false,
          message: "File upload failed during update",
          error: err.message,
        };
        return;
      }
    }

    const { error, value } = updateUserDocumentSchema.validate(data);

    if (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      };
      return;
    }

    const result = await UserDocumentService.updateUserDocument(
      id,
      value,
      userIdToPass
    );

    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};

export const deleteUserDocument = async (ctx: Context) => {
  try {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid document ID",
      };
      return;
    }

    // (Logic ที่เพิ่มเข้ามา)
    const tokenUserId = ctx.state.user?.id;
    const body = ctx.request.body || {};
    const userIdToPass = tokenUserId || body.user_id;

    const result = await UserDocumentService.deleteUserDocument(
      id,
      userIdToPass
    );

    if (result.success) {
      ctx.status = 200;
      ctx.body = result;
    } else {
      ctx.status = 404;
      ctx.body = result;
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};
export const getUserDocumentsByUserId = async (ctx: Context) => {
  try {
    // (Logic ที่แก้ไข)
    const tokenUserId = ctx.state.user?.id;
    if (!tokenUserId || isNaN(tokenUserId)) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "Invalid or missing user token",
      };
      return;
    }
    const result = await UserDocumentService.getUserDocumentsByUserId(
      tokenUserId
    );

    ctx.status = 200;
    ctx.body = result;
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};
export const getUserDocumentsByUserIdFromParams = async (ctx: Context) => {
  try {
    const userId = parseInt(ctx.params.userId);
    if (isNaN(userId)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Invalid user ID",
      };
      return;
    }
    const result = await UserDocumentService.getUserDocumentsByUserId(userId);
    ctx.status = 200;
    ctx.body = result;
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Internal server error",
      error: error.message,
    };
  }
};
