import { S3Client} from "@aws-sdk/client-s3";
import config from './config';

export const s3_public_asset = new S3Client({
  region: 'sgp1',
  endpoint: config.spaces.endpoint,
  credentials: {
    accessKeyId: config.spaces.key_public_asset!,
    secretAccessKey: config.spaces.secret_public_asset!,
  },
});

export const s3_user_data = new S3Client({
  region: 'sgp1',
  endpoint: config.spaces.endpoint,
  credentials: {
    accessKeyId: config.spaces.key_user_data!,
    secretAccessKey: config.spaces.secret_user_data!,
  },
});