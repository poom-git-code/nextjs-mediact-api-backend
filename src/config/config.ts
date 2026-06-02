import dotenv from 'dotenv';
dotenv.config();

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue!;
};

const config = {
  db: {
    // uri: getEnv('DB_URI'),
    DB_NAME: getEnv('DB_NAME'),
    DB_USER: getEnv('DB_USER'),
    DB_PASS: getEnv('DB_PASS'), 
    DB_HOST: getEnv('DB_HOST'), 
    DB_DIALECT: getEnv('DB_DIALECT'), 
    DB_PORT: getEnv('DB_PORT'), 
  },
  server: {
    port: parseInt(getEnv('PORT', '3600')),
  },
  jwt: {
    secret: getEnv('JWT_SECRET', 'default_secret'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '1h'),
  },
  spaces: {
    endpoint: getEnv('DO_SPACES_ENDPOINT', 'https://sgp1.digitaloceanspaces.com'),
    // Public asset bucket configuration
    bucket_public_asset: getEnv('DO_SPACES_BUCKET_PUBLIC_ASSET'),
    key_public_asset: getEnv('DO_SPACES_KEY_PUBLIC_ASSET'),
    secret_public_asset: getEnv('DO_SPACES_SECRET_PUBLIC_ASSET'),
    // User data bucket configuration
    bucket_user_data: getEnv('DO_SPACES_BUCKET_USER_DATA'),
    key_user_data: getEnv('DO_SPACES_KEY_USER_DATA'),
    secret_user_data: getEnv('DO_SPACES_SECRET_USER_DATA'),
  },
};

export default config;