import { Context } from "koa";
import * as UploadService from "../services/uploadService";
import Joi from "joi";
import fs from "fs";
import { addWatermark } from "../utils/watermark";
import path from "path";
import sharp from "sharp";
import { addPdfWatermark } from "../utils/watermarkpdf";
import os from "os";

//Handle uploa userdata
export const uploadUserDataFile = async (ctx: Context) => {
  const file = ctx.request.files?.file as any;
  if (!file) {
    ctx.status = 400;
    ctx.body = { error: "No file uploaded" };
    return;
  }

  // Reject if file is an array (multiple files uploaded)
  if (Array.isArray(file)) {
    ctx.status = 400;
    ctx.body = { error: "Only one file can be uploaded at a time" };
    return;
  }

  const filePath = file.filepath;
  const originalName = file.originalFilename;
  const timestamp = Date.now();

  // Extract extension (e.g., .png, .jpg)
  const parts = originalName.split('_');
  const nameOfFileWithExtension = parts[1];
  const user_id = parts[0];
  const nameOfFile = nameOfFileWithExtension.substring(0, nameOfFileWithExtension.lastIndexOf('.'));
  const extension = nameOfFileWithExtension.substring(nameOfFileWithExtension.lastIndexOf('.'));

  // console.log("File upload details:", {
  //   user_id,
  //   nameOfFile,
  //   extension,
  //   originalName,
  //   filePath,
  //   timestamp,
  // });

  if (
    parts.length !== 2 ||                     // Must have exactly one underscore
    !parts[0].match(/^\d+$/) ||               // user_id should be all digits
    !parts[1].includes('.') ||                // filename must include an extension
    !extension                                          // Must have a valid extension
  ) {
    ctx.status = 400;
    ctx.body = {
      error: "Filename must follow format: <user_id>_filename.ext (e.g. 12345_resume.pdf)"
    };
    return;
  }

  // Route based on extension
  let prefix: string;
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) {
    prefix = 'pictures';
  } else if (extension === '.pdf') {
    prefix = 'documents';
  } else {
    ctx.status = 400;
    ctx.body = { error: "Unsupported file type" };
    return;
  }

  // Build new filename with timestamp
  const fileName = `${nameOfFile}_${timestamp}${extension}`;
  const key = `${user_id}/${prefix}/${fileName}`;

  //Add Watermark
  const watermarkPath = path.join(__dirname, "../assets/mediact.png");
  // const watermarkedPath = `/tmp/watermarked-${timestamp}${extension}`;
  const filename = `watermarked-${timestamp}${extension}`
  const watermarkedPath = path.join(os.tmpdir(), filename)

  try {
    if (['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) {
      await addWatermark(filePath, watermarkPath, watermarkedPath);
    } else if (extension === '.pdf') {
      await addPdfWatermark(filePath, watermarkedPath, "MediAct");
    }
  } catch (err) {
    console.error("❌ Failed to add watermark:", err);
    ctx.status = 500;
    ctx.body = { error: "Failed to generate watermarked file" };
    return;
  }

  try {
    const result = await UploadService.uploadUserDataFileToSpace(watermarkedPath, key);

    // Optionally, remove the local file after upload
    // fs.unlinkSync(filePath);
    // fs.unlinkSync(watermarkedPath);

    fs.unlink(filePath, (err: any) => {
      if (err) {
        console.warn("Failed to delete original file:", err.message);
      }
    });

    fs.unlink(watermarkedPath, (err: any) => {
      if (err) {
        console.warn("Failed to delete watermarked file:", err.message);
      }
    });

    ctx.body = {
      message: "File uploaded successfully",
      result,
      key
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
};

export const getUserDataPresignedUrl = async (ctx: Context) => {
  const key = ctx.query.key as string;

  if (!key) {
    ctx.status = 400;
    ctx.body = { error: "Missing key parameter" };
    return;
  }

  try {
    const url = await UploadService.getPresignedUrlForUserDataFile(key);
    ctx.body = {
      message: "Presigned URL generated successfully",
      url,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      error: (error as Error).message || "Failed to generate signed URL",
    };
  }
};

export const uploadFilePublic = async (ctx: Context) => {

  console.log("uploadFilePublic called");
  console.log("Request body:", ctx.request.files?.file);

  try {
    const file = ctx.request.files?.file as any;

    if (!file || Array.isArray(file)) {
      ctx.status = 400;
      ctx.body = { error: "No valid file provided" };
      return;
    }

    const filePath = file.filepath;
    const originalName = file.originalFilename;
    const timestamp = Date.now(); // or use moment() if you prefer formatting

    // Extract extension (e.g., .png, .jpg)
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));

    // Build new filename with timestamp
    const fileName = `${nameWithoutExt}_${timestamp}${extension}`;

    const key = `uploads/${fileName}`;

    const result = await UploadService.uploadPublicFileToSpace(filePath, key);

    // Optional cleanup of temp file
    fs.unlink(filePath, () => { });

    const resultKey = result.Key;
    const bucketName = result.Bucket;

    const region = 'sgp1';
    const finalUrl = `https://${bucketName}.${region}.digitaloceanspaces.com/${resultKey}`;

    ctx.status = 200;
    ctx.body = {
      message: "File uploaded successfully",
      data: {
        url: finalUrl
      },
    };
    console.log("File uploaded successfully:", result);

  } catch (error) {
    ctx.status = 500;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const deleteFilePublic = async (ctx: Context) => {
  try {
    const { key } = ctx.request.body;

    if (!key) {
      ctx.status = 400;
      ctx.body = { error: "Missing 'key' in request body" };
      return;
    }

    const result = await UploadService.deleteFileFromSpace(key);

    ctx.status = 200;
    ctx.body = {
      message: "File deleted successfully",
      result,
    };
  } catch (error) {
    ctx.status = 500;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// Handle upload user data file (no watermark)
export const uploadUserDataFileNoWatermark = async (ctx: Context) => {
  const file = ctx.request.files?.file as any
  if (!file) {
    ctx.status = 400;
    ctx.body = { error: "No file uploaded" }
    return
  }

  // Reject if file is an array (multiple files uploaded)
  if (Array.isArray(file)) {
    ctx.status = 400;
    ctx.body = { error: "Only one file can be uploaded at a time" };
    return
  }

  const filePath = file.filepath;
  const originalName = file.originalFilename;

  const underscoreIndex = originalName.indexOf('_')

  if (underscoreIndex === -1) {
    ctx.status = 400
    ctx.body = {
      error: "Filename must follow format: <user_id>_filename.ext (e.g. 12345_resume.pdf)"
    }
    return
  }

  const timestamp = Date.now();

  const user_id = originalName.substring(0, underscoreIndex)
  const nameOfFile = originalName.substring(underscoreIndex + 1, originalName.lastIndexOf('.'))
  const extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase()

  // Route based on extension
  let prefix: string;
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
    prefix = "pictures";
  } else if (extension === ".pdf") {
    prefix = "documents";
  } else {
    ctx.status = 400;
    ctx.body = { error: "Unsupported file type" };
    return
  }

  // Build new filename with timestamp
  const fileName = `${nameOfFile}_${timestamp}${extension}`
  const key = `${user_id}/${prefix}/${fileName}`

  try {
    const result = await UploadService.uploadUserDataFileToSpace(filePath, key);
    // Optionally, remove the local file after upload
    fs.unlinkSync(filePath);
    ctx.body = {
      message: "File uploaded successfully (no watermark)",
      result,
      key
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: (error as Error).message };
  }
};