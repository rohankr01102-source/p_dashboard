import dotenv from "dotenv";
import path from "path";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const DEFAULT_DEV_JWT_SECRET = "vocalytics-super-secret-development-jwt-key-2026";
const jwtSecret = process.env.JWT_SECRET || DEFAULT_DEV_JWT_SECRET;

if (NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEFAULT_DEV_JWT_SECRET)) {
  throw new Error(
    "[FATAL SECURITY CONFIGURATION] In production mode, you must set a strong, non-default JWT_SECRET environment variable."
  );
}

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vocalytics",
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000",
  UPLOAD_DIR: path.resolve(__dirname, "../../uploads"),
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
};
