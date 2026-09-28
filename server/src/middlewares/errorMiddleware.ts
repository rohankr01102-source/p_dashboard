import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../utils/appError";
import { ApiResponse } from "../utils/apiResponse";
import { ENV } from "../config/env";
import { Logger } from "../utils/logger";

/**
 * Enterprise Global Exception & Error Handler Middleware
 * Normalizes all database, framework, security, and application errors
 * into a single unified JSON envelope with correlation tracing.
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isDevelopment = ENV.NODE_ENV === "development";
  const reqId = (req as any).id || (req as any).requestId || req.headers["x-request-id"] || "-";

  // Log structured error context
  Logger.error(
    `[Error Handler] [Req: ${reqId}] ${req.method} ${req.originalUrl} - ${err.message || "Unknown error"}`,
    err
  );

  // If response headers have already been sent (e.g., during audio stream piping), delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Structured Application Error (AppError hierarchy)
  if (err instanceof AppError) {
    ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      err.code,
      err.details,
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 2. Mongoose Schema Validation Error
  if (err.name === "ValidationError" && err.errors) {
    const fieldErrors: Record<string, string> = {};
    Object.keys(err.errors).forEach((key) => {
      fieldErrors[key] = err.errors[key].message;
    });

    ApiResponse.error(
      res,
      "Validation failed for submitted data.",
      422,
      "VALIDATION_ERROR",
      fieldErrors,
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 3. Mongoose Cast Error (invalid ObjectId / type casting)
  if (err.name === "CastError") {
    ApiResponse.error(
      res,
      `Invalid identifier format for field '${err.path}': ${err.value}`,
      400,
      "INVALID_IDENTIFIER",
      { path: err.path, value: err.value },
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 4. MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000 || err.name === "MongoServerError" && err.code === 11000) {
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    const field = keys.length > 0 ? keys[0] : "resource";
    const value = err.keyValue ? err.keyValue[field] : undefined;

    ApiResponse.error(
      res,
      `A record with this ${field} already exists: ${value || "conflict"}.`,
      409,
      "DUPLICATE_RESOURCE",
      { field, value },
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 5. JWT Authentication Errors
  if (err.name === "TokenExpiredError") {
    ApiResponse.error(
      res,
      "Authentication token has expired. Please sign in again.",
      401,
      "TOKEN_EXPIRED",
      { expiredAt: err.expiredAt },
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  if (err.name === "JsonWebTokenError") {
    ApiResponse.error(
      res,
      "Invalid or corrupted authentication token.",
      401,
      "INVALID_TOKEN",
      undefined,
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 6. Multer File Upload Errors
  if (err instanceof multer.MulterError) {
    let message = `File upload failed: ${err.message}`;
    let code = "FILE_UPLOAD_ERROR";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File exceeds the maximum permitted upload limit (50MB).";
      code = "FILE_TOO_LARGE";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = `Unexpected file field '${err.field}'. Expected 'audio'.`;
      code = "UNEXPECTED_FILE_FIELD";
    }

    ApiResponse.error(
      res,
      message,
      400,
      code,
      { multerCode: err.code, field: err.field },
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 7. Malformed JSON Body Syntax Error
  if (err instanceof SyntaxError && "body" in err) {
    ApiResponse.error(
      res,
      "Malformed JSON payload provided.",
      400,
      "INVALID_JSON_BODY",
      undefined,
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 8. CORS Restriction Error
  if (err.message && err.message.includes("CORS blocked")) {
    ApiResponse.error(
      res,
      err.message,
      403,
      "CORS_ORIGIN_DENIED",
      undefined,
      undefined,
      isDevelopment ? err.stack : undefined
    );
    return;
  }

  // 9. Unhandled Fallback Server Error (500)
  const statusCode =
    typeof err.statusCode === "number"
      ? err.statusCode
      : typeof err.status === "number"
      ? err.status
      : 500;

  const isProduction = ENV.NODE_ENV === "production";
  const userSafeMessage =
    isProduction && statusCode === 500
      ? "An unexpected internal server error occurred."
      : err.message || "An unexpected server error occurred.";

  ApiResponse.error(
    res,
    userSafeMessage,
    statusCode,
    err.code || "INTERNAL_SERVER_ERROR",
    err.details,
    undefined,
    !isProduction ? err.stack : undefined
  );
};

/**
 * Global Process-Level Exception Handlers
 * Catches uncaught exceptions and unhandled promise rejections
 * to ensure resilience, clear diagnostics, and graceful termination.
 */
export const setupGlobalExceptionHandlers = (): void => {
  process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
    Logger.error(
      `[CRITICAL] Unhandled Promise Rejection at: ${JSON.stringify(promise)}, reason: ${
        reason instanceof Error ? reason.stack : reason
      }`
    );
  });

  process.on("uncaughtException", (error: Error) => {
    Logger.error(`[FATAL] Uncaught Exception encountered: ${error.message}`, error);
    // In production, exit safely to allow orchestrator (Kubernetes/PM2) to restart container
    if (ENV.NODE_ENV === "production") {
      process.exit(1);
    }
  });
};
