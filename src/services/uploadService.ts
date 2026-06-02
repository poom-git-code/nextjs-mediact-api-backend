import fs from 'fs';
import { Upload } from '@aws-sdk/lib-storage';
import {
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import config from '../config/config';
import { s3_public_asset, s3_user_data } from '../config/s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Upload a file to DigitalOcean Spaces using AWS SDK v3
 */
export const uploadPublicFileToSpace = async (localPath: string, key: string) => {
  const fileStream = fs.createReadStream(localPath);

  const upload = new Upload({
    client: s3_public_asset,
    params: {
      Bucket: config.spaces.bucket_public_asset!,
      Key: key,
      Body: fileStream,
      ACL: 'public-read',
      //ContentType: "image/png",               // ✅ This tells the browser what it is
      //ContentDisposition: "inline",           // ✅ This tells the browser to display it
    },
  });

  try {
    const result = await upload.done();
    return result;
  } catch (err) {
    throw new Error(`Upload failed: ${(err as Error).message}`);
  }
};

/**
 * Delete a file from DigitalOcean Spaces using AWS SDK v3
 */
export const deleteFileFromSpace = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: config.spaces.bucket_public_asset!,
    Key: key,
  });

  try {
    const result = await s3_public_asset.send(command);
    return result;
  } catch (err) {
    throw new Error(`Delete failed: ${(err as Error).message}`);
  }
};

/**
 * Upload a secret/private file to DigitalOcean Spaces using AWS SDK v3
 * The file will not be publicly accessible.
 */
export const uploadUserDataFileToSpace = async (localPath: string, key: string, options?: { ACL?: string }) => {
  const fileStream = fs.createReadStream(localPath);
  
  // Detect content type based on file extension
  const getContentType = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  };

  const upload = new Upload({
    client: s3_user_data,
    params: {
      Bucket: config.spaces.bucket_user_data!, // Make sure this is set in your config
      Key: key,
      Body: fileStream,
      ACL: (options?.ACL || 'private') as any, // Keep private for security, use signed URLs
      ContentType: getContentType(key), // Auto-detect content type
    },
  });

  try {
    const result = await upload.done();
    return result;
  } catch (err) {
    throw new Error(`Secret upload failed: ${(err as Error).message}`);
  }
};

export const getPresignedUrlForUserDataFile = async (key: string, expiresInSeconds = 300): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: config.spaces.bucket_user_data!,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3_user_data, command, {
      expiresIn: expiresInSeconds, // default 5 minutes
    });

    return signedUrl;
  } catch (err) {
    throw new Error(`Failed to generate presigned URL: ${(err as Error).message}`);
  }
};
