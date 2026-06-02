import UserCertificationModel from "../models/UserCertificationModel";
import CertificationModel from "../models/CertificationModel";
import InstitutionModel from "../models/InstitutionModel";
import { createUserDocument } from "./UserDocumentService";
import * as UploadService from "./uploadService";
import { addWatermark } from "../utils/watermark";
import { addPdfWatermark } from "../utils/watermarkpdf";
import path from "path";
import fs from "fs";
import os from "os";
import { Op } from "sequelize";
import UserDocumentModel from "../models/UserDocumentModel";

// Generate auto document number for certifications
const generateCertificationDocumentNumber = async (
  prefix: string = "SPL_CERT"
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
      // Format: SPL_CERT_25_0001
      const parts = latestDoc.document_number.split("_");
      if (parts.length >= 4 && parts[2] === yearSuffix) {
        const lastNumber = parseInt(parts[3]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    // Format: SPL_CERT_YY_NNNN (e.g., SPL_CERT_25_0001)
    const documentNumber = `${prefix}_${yearSuffix}_${nextNumber
      .toString()
      .padStart(4, "0")}`;

    return documentNumber;
  } catch (error) {
    console.error("Error generating certification document number:", error);
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}_${timestamp}`;
  }
};

// Helper function to generate signed URL from file_url (same as UserDocumentService)
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

export const getAllUserCertifications = async () => {
  const certifications = await UserCertificationModel.findAll({
    where: { is_active: true },
    include: [
      { model: CertificationModel, as: "certification_info" },
      { model: InstitutionModel, as: "institution_info" },
      {
        model: UserDocumentModel,
        as: "document",
        required: false, // LEFT JOIN - include even if no document
        where: {
          id: { [Op.col]: "UserCertificationModel.document_id" },
          is_deleted: 0,
        },
      },
    ],
    order: [["id", "ASC"]],
  });

  // Process each certification to add signed URLs for documents
  const processedCertifications = await Promise.all(
    certifications.map(async (cert) => {
      const certJson = cert.toJSON();

      // If there's a document with file_url, generate signed URL
      if (certJson.document && certJson.document.file_url) {
        try {
          const signedUrl = await generateSignedUrl(certJson.document.file_url);
          if (signedUrl) {
            certJson.document.signed_url = signedUrl;
            certJson.document.file_url_original = certJson.document.file_url;
          }
        } catch (error) {
          console.error(
            "Error generating signed URL for certification document:",
            error
          );
        }
      }

      return certJson;
    })
  );

  return processedCertifications;
};

export const getUserCertificationById = async (id: number) => {
  //   console.log("Fetching user certification with ID:", id);
  const certification = await UserCertificationModel.findByPk(id, {
    include: [
      { model: CertificationModel, as: "certification_info" },
      { model: InstitutionModel, as: "institution_info" },
      {
        model: UserDocumentModel,
        as: "document",
        required: false, // LEFT JOIN - include even if no document
        where: {
          id: { [Op.col]: "UserCertificationModel.document_id" },
          is_deleted: 0,
        },
      },
    ],
  });

  if (!certification) return null;

  const certJson = certification.toJSON();

  // If there's a document with file_url, generate signed URL
  if (certJson.document && certJson.document.file_url) {
    try {
      const signedUrl = await generateSignedUrl(certJson.document.file_url);
      if (signedUrl) {
        certJson.document.signed_url = signedUrl;
        certJson.document.file_url_original = certJson.document.file_url;
      }
    } catch (error) {
      console.error(
        "Error generating signed URL for certification document:",
        error
      );
    }
  }

  return certJson;
};

export const getUserCertificationsByToken = async (user_id: number) => {
  console.log("Fetching user certification with ID:", user_id);
  const certifications = await UserCertificationModel.findAll({
    where: { user_id, is_active: true },
    include: [
      { model: CertificationModel, as: "certification_info" },
      { model: InstitutionModel, as: "institution_info" },
      {
        model: UserDocumentModel,
        as: "document",
        required: false, // LEFT JOIN - include even if no document
        where: {
          id: { [Op.col]: "UserCertificationModel.document_id" },
          is_deleted: 0,
        },
      },
    ],
  });

  // Process each certification to add signed URLs for documents
  const processedCertifications = await Promise.all(
    certifications.map(async (cert) => {
      const certJson = cert.toJSON();

      // If there's a document with file_url, generate signed URL
      if (certJson.document && certJson.document.file_url) {
        try {
          const signedUrl = await generateSignedUrl(certJson.document.file_url);
          if (signedUrl) {
            certJson.document.signed_url = signedUrl;
            certJson.document.file_url_original = certJson.document.file_url;
          }
        } catch (error) {
          console.error(
            "Error generating signed URL for certification document:",
            error
          );
        }
      }

      return certJson;
    })
  );

  return processedCertifications;
};

export const getUserCertificationsByUserId = async (user_id: number) => {
  const certifications = await UserCertificationModel.findAll({
    where: { user_id, is_active: true },
    include: [
      { model: CertificationModel, as: "certification_info" },
      { model: InstitutionModel, as: "institution_info" },
      {
        model: UserDocumentModel,
        as: "document",
        required: false, // LEFT JOIN - include even if no document
        where: {
          id: { [Op.col]: "UserCertificationModel.document_id" },
          is_deleted: 0,
        },
      },
    ],
    order: [["id", "ASC"]],
  });

  // Process each certification to add signed URLs for documents
  const processedCertifications = await Promise.all(
    certifications.map(async (cert) => {
      const certJson = cert.toJSON();

      // If there's a document with file_url, generate signed URL
      if (certJson.document && certJson.document.file_url) {
        try {
          const signedUrl = await generateSignedUrl(certJson.document.file_url);
          if (signedUrl) {
            certJson.document.signed_url = signedUrl;
            certJson.document.file_url_original = certJson.document.file_url;
          }
        } catch (error) {
          console.error(
            "Error generating signed URL for certification document:",
            error
          );
        }
      }

      return certJson;
    })
  );

  return processedCertifications;
};

export const createUserCertification = async (data: any, userId: number) => {
  // Generate auto document number if not provided
  let autoDocumentNumber = data.document_number;
  if (!autoDocumentNumber) {
    autoDocumentNumber = await generateCertificationDocumentNumber("SPL_CERT");
  }

  return await UserCertificationModel.create({
    ...data,
    user_id: userId,
    created_by: userId,
    updated_by: userId,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const createUserCertificationWithFile = async (
  data: any,
  file: any,
  userId: number
) => {
  try {
    // determine owner: prefer authenticated userId param, fallback to data.user_id
    const ownerId = userId || Number(data.user_id);
    if (!ownerId) throw new Error("Missing user id");

    // Check if file is actually a file object or just a string
    const hasValidFile =
      file &&
      typeof file === "object" &&
      (file.filepath ||
        file.path ||
        file.originalFilename ||
        file.originalname);

    if (!hasValidFile && typeof file === "string") {
      console.warn(
        `⚠️ Received filename string instead of file object: ${file}`
      );
      console.warn(
        "📝 Creating certification without file upload. Client should send multipart/form-data with actual file."
      );
    }

    // optional filename check: if filename starts with "<id>_" verify it matches ownerId
    if (hasValidFile) {
      const originalName: string =
        file.originalname || file.filename || file.originalFilename || "";
      const m = originalName.match(/^(\d+)_/);
      if (m) {
        const prefixId = Number(m[1]);
        if (prefixId !== ownerId) {
          console.warn(
            `Uploaded filename user id ${prefixId} != owner ${ownerId} — continuing but not trusting filename.`
          );
          // throw new Error('Filename user id mismatch'); // <-- strict mode
        }
      }
    }

    // proceed: watermark/upload file, create UserDocument (document_type_id = 1), then create UserCertification with document_id
    let documentId = null;

    // Generate auto document number if not provided
    let autoDocumentNumber = data.document_number;
    if (!autoDocumentNumber) {
      autoDocumentNumber = await generateCertificationDocumentNumber(
        "SPL_CERT"
      );
    }

    // Process file if provided and valid
    if (hasValidFile) {
      const filePath = file.filepath || file.path;
      const originalName =
        file.originalFilename || file.originalname || file.filename;
      const timestamp = Date.now();

      // Extract extension and filename (allow any filename, don't require <userId>_ prefix)
      // Accept any filename; derive name and extension from last dot
      const nameWithExt = originalName || "";
      const lastDot = nameWithExt.lastIndexOf(".");
      if (lastDot === -1)
        throw new Error("Filename must include an extension.");
      const nameOfFile = nameWithExt.substring(0, lastDot);
      const extension = nameWithExt.substring(lastDot).toLowerCase();

      // Check file type
      if (![".png", ".jpg", ".jpeg", ".webp", ".pdf"].includes(extension)) {
        throw new Error("Unsupported file type");
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
      const filename = `watermarked-${timestamp}${extension}`;
      const watermarkedPath = path.join(os.tmpdir(), filename);

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

      // Create UserDocument with document_type_id = 1
      const userDocumentResult = await createUserDocument({
        user_id: userId,
        document_type_id: 1, // Fixed to 1 as specified
        file_url:
          uploadResult.Location ||
          `https://your-space.sgp1.digitaloceanspaces.com/${key}`,
        document_number: autoDocumentNumber,
        issue_date: data.start_date || null,
        expiry_date: data.graduate_date || null,
        status: "PENDING",
        uploaded_at: new Date(),
      });

      if (userDocumentResult.success && userDocumentResult.data) {
        documentId = userDocumentResult.data.id;
        console.log(`✅ Document created with ID: ${documentId}`);
      }

      // Clean up temporary files
      fs.unlink(filePath, (err: any) => {
        if (err) console.warn("Failed to delete original file:", err.message);
      });

      fs.unlink(watermarkedPath, (err: any) => {
        if (err)
          console.warn("Failed to delete watermarked file:", err.message);
      });
    } else {
      console.log(
        `📝 No valid file provided. Creating certification without document.`
      );
    }

    // Create UserCertification with document_id (can be null)
    const certificationData = {
      ...data,
      document_id: documentId,
      user_id: userId,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const certification = await UserCertificationModel.create(
      certificationData
    );

    // Fetch the created certification with associations
    const createdCertification = await UserCertificationModel.findByPk(
      certification.id,
      {
        include: [
          { model: CertificationModel, as: "certification_info" },
          { model: InstitutionModel, as: "institution_info" },
          {
            model: UserDocumentModel,
            as: "document",
            required: false, // LEFT JOIN - include even if no document
            where: {
              id: { [Op.col]: "UserCertificationModel.document_id" },
              is_deleted: 0,
            },
          },
        ],
      }
    );

    const successMessage = documentId
      ? "User certification created successfully with document"
      : "User certification created successfully without document";

    return {
      success: true,
      data: createdCertification,
      document_id: documentId,
      has_file: hasValidFile,
      message: successMessage,
    };
  } catch (error: any) {
    console.error("Error in createUserCertificationWithFile:", error);
    throw error;
  }
};

export const updateUserCertification = async (
  id: number,
  updates: any,
  userId: number,
  file?: any
) => {
  const record = await UserCertificationModel.findByPk(id);
  if (!record) throw new Error("User certification not found");

  let newDocumentId: string | number | null = record.document_id; // Keep existing document_id by default

  // Handle file upload if provided
  if (file) {
    const hasValidFile =
      file &&
      typeof file === "object" &&
      (file.filepath ||
        file.path ||
        file.originalFilename ||
        file.originalname);

    if (hasValidFile) {
      try {
        const filePath = file.filepath || file.path;
        const originalName =
          file.originalFilename || file.originalname || file.filename;
        const timestamp = Date.now();

        // Extract extension and filename
        const nameWithExt = originalName || "";
        const lastDot = nameWithExt.lastIndexOf(".");
        if (lastDot === -1)
          throw new Error("Filename must include an extension.");
        const nameOfFile = nameWithExt.substring(0, lastDot);
        const extension = nameWithExt.substring(lastDot).toLowerCase();

        // Check file type
        if (![".png", ".jpg", ".jpeg", ".webp", ".pdf"].includes(extension)) {
          throw new Error("Unsupported file type");
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
        const filename = `watermarked-${timestamp}${extension}`;
        const watermarkedPath = path.join(os.tmpdir(), filename);

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

        // Generate new document number
        const autoDocumentNumber = await generateCertificationDocumentNumber(
          "SPL_CERT"
        );

        // Create new UserDocument or update existing one
        if (record.document_id) {
          // Update existing document
          const { updateUserDocument } = await import("./UserDocumentService");
          const updateResult = await updateUserDocument(
            Number(record.document_id),
            {
              file_url:
                uploadResult.Location ||
                `https://your-space.sgp1.digitaloceanspaces.com/${key}`,
              document_number: autoDocumentNumber,
              issue_date: updates.start_date || null,
              expiry_date: updates.expiry_date || null,
              status: "PENDING",
              uploaded_at: new Date(),
            }
          );

          if (updateResult.success) {
            console.log(
              `✅ Document ID ${record.document_id} updated successfully`
            );
          }
        } else {
          // Create new document
          const userDocumentResult = await createUserDocument({
            user_id: userId,
            document_type_id: 1, // Fixed to 1 as specified
            file_url:
              uploadResult.Location ||
              `https://your-space.sgp1.digitaloceanspaces.com/${key}`,
            document_number: autoDocumentNumber,
            issue_date: updates.start_date || null,
            expiry_date: updates.expiry_date || null,
            status: "PENDING",
            uploaded_at: new Date(),
          });

          if (userDocumentResult.success && userDocumentResult.data) {
            newDocumentId = userDocumentResult.data.id || null;
            console.log(`✅ New document created with ID: ${newDocumentId}`);
          }
        }

        // Clean up temporary files
        fs.unlink(filePath, (err: any) => {
          if (err) console.warn("Failed to delete original file:", err.message);
        });

        fs.unlink(watermarkedPath, (err: any) => {
          if (err)
            console.warn("Failed to delete watermarked file:", err.message);
        });
      } catch (error) {
        console.error(
          "Error processing file in updateUserCertification:",
          error
        );
        throw error;
      }
    } else if (typeof file === "string") {
      console.warn(
        `⚠️ Received filename string instead of file object in update: ${file}`
      );
    }
  }

  // Update certification data
  const updatedCertification = await record.update({
    ...updates,
    document_id: newDocumentId, // Update document_id if new document was created
    updated_by: userId,
    updated_at: new Date(),
  });

  // Return updated certification with associations
  return await UserCertificationModel.findByPk(id, {
    include: [
      { model: CertificationModel, as: "certification_info" },
      { model: InstitutionModel, as: "institution_info" },
      {
        model: UserDocumentModel,
        as: "document",
        required: false,
        where: {
          id: { [Op.col]: "UserCertificationModel.document_id" },
          is_deleted: 0,
        },
      },
    ],
  });
};

export const deleteUserCertification = async (id: number, userId: number) => {
  console.log("Deleting user certification with ID:", id);

  const record = await UserCertificationModel.findByPk(id);
  if (!record) throw new Error("User certification not found");

  // Store document_id before updating certification
  const documentId = record.document_id;

  // Soft delete the user certification (set is_active to false)
  const updatedCertification = await record.update({
    is_active: false,
    updated_by: userId,
    updated_at: new Date(),
  });

  // If there's an associated document, delete it as well
  if (documentId) {
    try {
      const { deleteUserDocument } = await import("./UserDocumentService");
      const deleteResult = await deleteUserDocument(Number(documentId));

      if (deleteResult.success) {
        console.log(
          `✅ Associated document ID ${documentId} deleted successfully`
        );
      } else {
        console.warn(
          `⚠️ Failed to delete associated document ID ${documentId}: ${deleteResult.message}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error deleting associated document ID ${documentId}:`,
        error
      );
      // Don't throw error here - certification deletion should still succeed
    }
  } else {
    console.log(
      `📝 No associated document to delete for certification ID ${id}`
    );
  }

  console.log(`✅ User certification ID ${id} deleted successfully`);
  return updatedCertification;
};
