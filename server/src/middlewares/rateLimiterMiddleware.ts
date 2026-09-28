import { Request, Response, NextFunction } from "express";
import rateLimit, { Options, RateLimitRequestHandler } from "express-rate-limit";
import { ApiResponse } from "../utils/apiResponse";

/**
 * Custom rate limit breach handler to return enterprise ApiResponse envelope
 */
const createRateLimitHandler = (defaultCode: string, defaultMessage: string) => {
  return (req: Request, res: Response, _next: NextFunction, options: Options): void => {
    const code = (options.message as any)?.error?.code || defaultCode;
    const message = (options.message as any)?.error?.message || defaultMessage;
    const retryAfter = Math.ceil(options.windowMs / 1000);

    res.set("Retry-After", String(retryAfter));
    ApiResponse.error(
      res,
      message,
      429,
      code,
      {
        retryAfterSeconds: retryAfter,
        limit: options.limit,
      }
    );
  };
};

export interface CustomRateLimiterOptions extends Partial<Options> {
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Enterprise Rate Limiter Factory
 */
export const createRateLimiter = (options: CustomRateLimiterOptions): RateLimitRequestHandler => {
  const {
    errorCode = "TOO_MANY_REQUESTS",
    errorMessage = "Too many requests. Please throttle your activity.",
    ...rateLimitOptions
  } = options;

  return rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true, // draft-7 RateLimit headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    handler: createRateLimitHandler(errorCode, errorMessage),
    ...rateLimitOptions,
  });
};

/**
 * Global API rate limiter: 200 requests per 1-minute window
 */
export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 200,
  errorCode: "TOO_MANY_REQUESTS",
  errorMessage: "API rate limit exceeded. Please throttle your requests.",
});

/**
 * Strict authentication limiter for login / registration brute-force defense
 * 50 requests per 15-minute sliding window
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  errorCode: "TOO_MANY_LOGIN_ATTEMPTS",
  errorMessage: "Too many authentication attempts. Please try again after 15 minutes.",
});

/**
 * Audio take upload rate limiter: 30 uploads per minute
 */
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  errorCode: "UPLOAD_RATE_LIMIT_EXCEEDED",
  errorMessage: "Too many audio uploads. Please wait before uploading more takes.",
});

/**
 * Compute-heavy AI analysis limiter: 20 analyses per minute
 */
export const aiAnalysisLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  errorCode: "ANALYSIS_RATE_LIMIT_EXCEEDED",
  errorMessage: "Too many vocal analysis requests. Please wait for processing to complete.",
});
