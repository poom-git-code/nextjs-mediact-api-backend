import { Op } from "sequelize";
import UserDocumentModel from "../models/UserDocumentModel";
import UserModel from "../models/UserModel";
import DocumentTypeModel from "../models/DocumentTypeModel";
import DocumentSubTypesModel from "../models/DocumentSubTypesModel";
import { UserDocumentCreationAttributes } from "../models/UserDocumentModel";
import * as UploadService from "./uploadService";
import { addWatermark } from "../utils/watermark";
import { addPdfWatermark } from "../utils/watermarkpdf";
import config from "../config/config";
import path from "path";
import fs from "fs";
import os from "os";
import UserEmploymentModel from "../models/UserEmploymentsModel";

const formatDateString = (
  dateInput: Date | string | undefined
): string | undefined => {
  if (!dateInput) {
    return undefined;
  }
  // ถ้า Joi แปลงเป็น Date object
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split("T")[0];
  }
  // ถ้ายังเป็น string (เช่น "2025-10-21")
  return dateInput;
};

// Generate auto document number for user documents
const generateDocumentNumber = async (
  prefix: string = "LIC_DOC"
): Promise<string> => {
  try {
    // Get current year
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // Get last 2 digits of year

    // Find the latest document number with the same prefix and year from UserDocument table
    const latestDoc = await UserDocumentModel.findOne({
      where: {
        document_number: {
          [Op.like]: `${prefix}_${yearSuffix}_%`,
        },
        is_deleted: 0,
      },
      order: [["id", "DESC"]],
      limit: 1,
    });

    let nextNumber = 1;

    if (latestDoc && latestDoc.document_number) {
      // Extract number from existing document_number pattern
      // Format: LIC_DOC_25_0001
      const parts = latestDoc.document_number.split("_");
      if (parts.length >= 4 && parts[2] === yearSuffix) {
        const lastNumber = parseInt(parts[3]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    // Format: LIC_DOC_YY_NNNN (e.g., LIC_DOC_25_0001)
    const documentNumber = `${prefix}_${yearSuffix}_${nextNumber
      .toString()
      .padStart(4, "0")}`;

    return documentNumber;
  } catch (error) {
    console.error("Error generating document number:", error);
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}_${timestamp}`;
  }
};

// Helper function to generate signed URL from file_url
const generateSignedUrl = async (fileUrl: string): Promise<string | null> => {
  try {
    // Handle different URL formats
    let key = "";

    // More robust URL parsing for DigitalOcean Spaces
    if (fileUrl.includes("digitaloceanspaces.com/")) {
      // Extract bucket name and key from URL
      // Format: https://bucket-name.sgp1.digitaloceanspaces.com/path/to/file
      const url = new URL(fileUrl);
      key = url.pathname.substring(1); // remove leading slash from pathname
    } else if (fileUrl.includes(".com/")) {
      // Fallback for other domains
      const parts = fileUrl.split(".com/");
      if (parts.length === 2) {
        key = parts[1];
      }
    } else {
      // If the fileUrl is already a key (not a full URL)
      key = fileUrl;
    }

    if (!key) {
      console.error("Could not extract key from file URL:", fileUrl);
      return null;
    }

    // Generate signed URL
    try {
      const signedUrl = await UploadService.getPresignedUrlForUserDataFile(
        key,
        3600
      ); // 1 hour expiry
      return signedUrl;
    } catch (error: any) {
      console.error(
        "File not found or error generating signed URL for key:",
        key,
        error.message
      );
      return null;
    }
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
};

// Create a new user document
export const createUserDocument = async (
  data: UserDocumentCreationAttributes,
  tokenUserId?: number
) => {
  try {
    // Determine user_id: prefer tokenUserId from authentication, fallback to data.user_id
    const userId = tokenUserId || data.user_id;
    if (!userId) {
      throw new Error(
        "Missing user_id: must be provided either from authentication token or request body"
      );
    }

    // Create document with determined userId
    const documentData = {
      ...data,
      user_id: userId,
    };

    const userDocument = await UserDocumentModel.create(documentData);

    // Fetch the created document with associations
    const createdDocument = await UserDocumentModel.findByPk(userDocument.id, {
      include: [
        {
          model: UserModel,
          as: "document_owner",
          attributes: ["id", "first_name", "last_name", "username"],
        },
        {
          model: DocumentTypeModel,
          as: "documentType",
          attributes: ["id", "type_code", "type_name"],
        },
        {
          model: DocumentSubTypesModel,
          as: "documentSubType",
          attributes: ["id", "sub_type_code", "sub_type_name"],
          required: false,
        },
      ],
    });

    // Generate signed URL for the created document
    let signedUrl = null;
    if (createdDocument && createdDocument.file_url) {
      signedUrl = await generateSignedUrl(createdDocument.file_url);
    }

    return {
      success: true,
      data: {
        ...createdDocument?.toJSON(),
        signed_url: signedUrl,
        file_url_original: createdDocument?.file_url,
      },
      message: "User document created successfully",
    };
  } catch (error: any) {
    throw error;
  }
};

// Create a new user document with file upload
export const createUserDocumentWithFile = async (
  data: any,
  file: any,
  tokenUserId?: number
) => {
  try {
    // Determine user_id: prefer tokenUserId from authentication, fallback to data.user_id
    const userId = tokenUserId || Number(data.user_id);
    if (!userId) {
      throw new Error(
        "Missing user_id: must be provided either from authentication token or request body"
      );
    }

    // Check if file is actually a file object or just a string
    const hasValidFile =
      file &&
      typeof file === "object" &&
      (file.filepath ||
        file.path ||
        file.originalFilename ||
        file.originalname);

    if (!hasValidFile) {
      if (typeof file === "string") {
        console.warn(
          `⚠️ Received filename string instead of file object: ${file}`
        );
        console.warn(
          "📝 Creating document without file upload. Client should send multipart/form-data with actual file."
        );
      }
      throw new Error(
        "Valid file object is required for createUserDocumentWithFile"
      );
    }

    // Process file upload
    const filePath = file.filepath || file.path;
    const originalName =
      file.originalFilename || file.originalname || file.filename;
    const timestamp = Date.now();

    // Extract extension and filename
    const nameWithExt = originalName || "";
    const lastDot = nameWithExt.lastIndexOf(".");
    if (lastDot === -1) throw new Error("Filename must include an extension.");
    const nameOfFile = nameWithExt.substring(0, lastDot);
    const extension = nameWithExt.substring(lastDot).toLowerCase();

    // Check file type
    if (![".png", ".jpg", ".jpeg", ".webp", ".pdf"].includes(extension)) {
      throw new Error(
        "Unsupported file type. Supported: png, jpg, jpeg, webp, pdf"
      );
    }

    // Route based on extension
    let prefix: string = "";
    if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
      prefix = "pictures";
    } else if (extension === ".pdf") {
      prefix = "documents";
    }

    // Build new filename with timestamp
    const fileName = `${nameOfFile}_${timestamp}${extension}`;
    const key = `${userId}/${prefix}/${fileName}`;

    // Add Watermark
    const watermarkPath = path.join(__dirname, "../assets/mediact.png");
    const watermarkedFilename = `watermarked-${timestamp}${extension}`;
    const watermarkedPath = path.join(os.tmpdir(), watermarkedFilename);

    try {
      if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
        await addWatermark(filePath, watermarkPath, watermarkedPath);
      } else if (extension === ".pdf") {
        await addPdfWatermark(filePath, watermarkedPath, "MediAct");
      }
    } catch (err) {
      console.error("❌ Failed to add watermark:", err);
      throw new Error("Failed to generate watermarked file");
    }

    // Upload to DigitalOcean Spaces (keep private for security)
    const uploadResult = await UploadService.uploadUserDataFileToSpace(
      watermarkedPath,
      key
    );

    // Generate document number if not provided
    let documentNumber = data.document_number;

    if (!documentNumber || documentNumber.trim() === "") {
      // Generate LIC_DOC document number with year and sequential numbering
      documentNumber = await generateDocumentNumber("LIC_DOC");
    } else {
      documentNumber = documentNumber.toString().trim();
    }

    // Create document with file URL
    const documentData = {
      user_id: userId,
      document_type_id: data.document_type_id || 1,
      document_sub_type_id: data.document_sub_type_id || null,
      file_url:
        uploadResult.Location ||
        `${config.spaces.endpoint}/${config.spaces.bucket_user_data}/${key}`,
      document_number: documentNumber,
      issue_date: data.issue_date || null,
      expiry_date: data.expiry_date || null,
      status: data.status || "PENDING",
      rejection_reason: data.rejection_reason || null,
      uploaded_at: new Date(),
    };

    const userDocument = await UserDocumentModel.create(documentData);

    // Clean up temporary files
    fs.unlink(filePath, (err: any) => {
      if (err) console.warn("Failed to delete original file:", err.message);
    });

    fs.unlink(watermarkedPath, (err: any) => {
      if (err) console.warn("Failed to delete watermarked file:", err.message);
    });

    // Fetch the created document with associations
    const createdDocument = await UserDocumentModel.findByPk(userDocument.id, {
      include: [
        {
          model: UserModel,
          as: "document_owner",
          attributes: ["id", "first_name", "last_name", "username"],
        },
        {
          model: DocumentTypeModel,
          as: "documentType",
          attributes: ["id", "type_code", "type_name"],
        },
        {
          model: DocumentSubTypesModel,
          as: "documentSubType",
          attributes: ["id", "sub_type_code", "sub_type_name"],
          required: false,
        },
      ],
    });

    // Generate signed URL for the created document
    let signedUrl = null;
    if (createdDocument && createdDocument.file_url) {
      signedUrl = await generateSignedUrl(createdDocument.file_url);
    }

    return {
      success: true,
      data: {
        ...createdDocument?.toJSON(),
        signed_url: signedUrl,
        file_url_original: createdDocument?.file_url,
      },
      message: "User document created successfully with file upload",
    };
  } catch (error: any) {
    console.error("Error in createUserDocumentWithFile:", error);
    throw error;
  }
};

// Get all user documents with filtering and pagination
export const getUserDocuments = async (filters: {
  user_id?: number;
  document_type_id?: number;
  document_sub_type_id?: number;
  status?: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
  facilityId?: number;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const {
      user_id,
      document_type_id,
      document_sub_type_id,
      status,
      page = 1,
      limit = 20,
      searchQuery,
      facilityId,
      departmentId,
      startDate,
      endDate,
    } = filters;

    const offset = page > 0 && limit > 0 ? (page - 1) * limit : 0;

    const whereClause: any = {
      is_deleted: 0,
    };

    if (user_id) {
      whereClause.user_id = user_id;
    }
    if (status) {
      whereClause.status = status;
    }

    const start = formatDateString(startDate);
    const end = formatDateString(endDate);

    if (start && end) {
      whereClause.uploaded_at = {
        [Op.between]: [`${start} 00:00:00`, `${end} 23:59:59`],
      };
    } else if (start) {
      whereClause.uploaded_at = { [Op.gte]: `${start} 00:00:00` };
    } else if (end) {
      whereClause.uploaded_at = { [Op.lte]: `${end} 23:59:59` };
    }

    const userInclude: any = {
      model: UserModel,
      as: "document_owner",
      attributes: ["id", "first_name", "last_name", "username", "email"],
      required: true,
    };

    const employmentWhere: any = {};

    if (searchQuery) {
      const orClauses: any[] = [
        { "$document_owner.first_name$": { [Op.like]: `%${searchQuery}%` } },
        { "$document_owner.last_name$": { [Op.like]: `%${searchQuery}%` } },
        { "$document_owner.email$": { [Op.like]: `%${searchQuery}%` } },
        { "$document_owner.username$": { [Op.like]: `%${searchQuery}%` } },
      ];

      if (!isNaN(Number(searchQuery))) {
        orClauses.push({ user_id: Number(searchQuery) });
      }

      whereClause[Op.or] = orClauses;
    }

    if (facilityId) {
      employmentWhere.facility_id = facilityId;
    }
    if (departmentId) {
      employmentWhere.department_id = departmentId;
    }

    if (facilityId || departmentId) {
      userInclude.include = [
        {
          model: UserEmploymentModel,

          as: "user_employment",

          where: employmentWhere,
          required: true,
        },
      ];
    }

    const queryOptions: any = {
      where: whereClause,
      include: [
        userInclude,
        {
          model: DocumentTypeModel,
          as: "documentType",
          attributes: ["id", "type_code", "type_name"],
        },
        {
          model: DocumentSubTypesModel,
          as: "documentSubType",
          attributes: ["id", "sub_type_code", "sub_type_name"],
          required: false,
        },
      ],
      offset,
      order: [["uploaded_at", "DESC"]],
      limit: limit === -1 ? undefined : limit,
      subQuery: false,
    };

    const { count, rows } = await UserDocumentModel.findAndCountAll(
      queryOptions
    );
    // Process each document to add signed URLs for files
    const processedDocuments = await Promise.all(
      rows.map(async (doc) => {
        const docJson = doc.toJSON() as any;

        // If there's a file_url, generate signed URL
        if (docJson.file_url) {
          try {
            const signedUrl = await generateSignedUrl(docJson.file_url);
            docJson.signed_url = signedUrl;
            docJson.file_url_original = docJson.file_url;
          } catch (error) {
            console.error("Error generating signed URL for document:", error);
          }
        }

        return docJson;
      })
    );

    return {
      success: true,
      data: {
        documents: processedDocuments,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: limit === -1 ? 1 : Math.ceil(count / limit),
        },
      },
    };
  } catch (error: any) {
    throw error;
  }
};
// Get user document by ID
export const getUserDocumentById = async (id: number) => {
  try {
    const userDocument = await UserDocumentModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          as: "document_owner",
          attributes: ["id", "first_name", "last_name", "username"],
        },
        {
          model: DocumentTypeModel,
          as: "documentType",
          attributes: ["id", "type_code", "type_name", "description"],
        },
        {
          model: DocumentSubTypesModel,
          as: "documentSubType",
          attributes: ["id", "sub_type_code", "sub_type_name"],
          required: false,
        },
      ],
    });

    if (!userDocument || userDocument.is_deleted) {
      return {
        success: false,
        message: "User document not found",
      };
    }

    const docJson = userDocument.toJSON() as any;

    // If there's a file_url, generate signed URL
    if (docJson.file_url) {
      try {
        const signedUrl = await generateSignedUrl(docJson.file_url);
        docJson.signed_url = signedUrl;
        docJson.file_url_original = docJson.file_url;
      } catch (error) {
        console.error("Error generating signed URL for document:", error);
      }
    }

    return {
      success: true,
      data: docJson,
    };
  } catch (error: any) {
    throw error;
  }
};

// Update user document
export const updateUserDocument = async (
  id: number,
  data: Partial<UserDocumentCreationAttributes>,
  tokenUserId?: number
) => {
  try {
    const userDocument = await UserDocumentModel.findByPk(id);

    if (!userDocument) {
      return {
        success: false,
        message: "User document not found",
      };
    }

    // If tokenUserId is provided, verify ownership (optional security check)
    // หมายเหตุ: Logic นี้อาจต้องปรับแก้หาก Admin (ที่มี tokenUserId ไม่ตรงกับ user_id) ต้องการอัปเดต
    // if (tokenUserId && userDocument.user_id !== tokenUserId) {
    //   return {
    //     success: false,
    //     message: "Access denied: You can only update your own documents",
    //   };
    // }

    // If status is being updated to APPROVED or REJECTED, set verified_at
    if (data.status && ["APPROVED", "REJECTED"].includes(data.status)) {
      data.verified_at = new Date();
    }

    // Only update uploaded_at when the document file itself changes (file_url changed)
    if (data.file_url && data.file_url !== userDocument.file_url) {
      data.uploaded_at = new Date();
    } else {
      // Prevent uploaded_at from being overwritten when updating other fields
      delete data.uploaded_at;
    }

    await userDocument.update(data);

    // Fetch updated document with associations
    const updatedDocument = await UserDocumentModel.findByPk(id, {
      include: [
        {
          model: UserModel,
          as: "document_owner",
          attributes: ["id", "first_name", "last_name", "username"],
        },
        {
          model: DocumentTypeModel,
          as: "documentType",
          attributes: ["id", "type_code", "type_name"],
        },
        {
          model: DocumentSubTypesModel,
          as: "documentSubType",
          attributes: ["id", "sub_type_code", "sub_type_name"],
          required: false,
        },
      ],
    });

    return {
      success: true,
      data: updatedDocument,
      message: "User document updated successfully",
    };
  } catch (error: any) {
    throw error;
  }
};

// Delete user document (Soft Delete)
export const deleteUserDocument = async (id: number, tokenUserId?: number) => {
  try {
    const userDocument = await UserDocumentModel.findByPk(id);

    if (!userDocument || userDocument.is_deleted) {
      return {
        success: false,
        message: "User document not found",
      };
    }

    // If tokenUserId is provided, verify ownership (optional security check)
    // if (tokenUserId && userDocument.user_id !== tokenUserId) {
    //   return {
    //     success: false,
    //     message: "Access denied: You can only delete your own documents",
    //   };
    // }

    // Soft delete by setting is_deleted = 1
    await userDocument.update({ is_deleted: true });

    return {
      success: true,
      message: "User document deleted successfully",
    };
  } catch (error: any) {
    throw error;
  }
};

// Get user documents by user ID
export const getUserDocumentsByUserId = async (userId: number) => {
  try {
    const userDocuments = await UserDocumentModel.findAll({
      where: { user_id: userId, is_deleted: 0 },
      include: [
        {
          model: DocumentTypeModel,
          as: "documentType",
          attributes: ["id", "type_code", "type_name", "description"],
        },
        {
          model: DocumentSubTypesModel,
          as: "documentSubType",
          attributes: ["id", "sub_type_code", "sub_type_name"],
          required: false,
        },
      ],
      order: [["uploaded_at", "DESC"]],
    });

    // Process each document to add signed URLs for files
    const processedDocuments = await Promise.all(
      userDocuments.map(async (doc) => {
        const docJson = doc.toJSON() as any;

        // If there's a file_url, generate signed URL
        if (docJson.file_url) {
          try {
            const signedUrl = await generateSignedUrl(docJson.file_url);
            docJson.signed_url = signedUrl;
            docJson.file_url_original = docJson.file_url;
          } catch (error) {
            console.error("Error generating signed URL for document:", error);
          }
        }

        return docJson;
      })
    );

    return {
      success: true,
      data: processedDocuments,
    };
  } catch (error: any) {
    throw error;
  }
};
