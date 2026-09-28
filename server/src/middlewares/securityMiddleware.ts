import { Request, Response, NextFunction, RequestHandler } from "express";
import helmet from "helmet";
import cors from "cors";
import crypto from "crypto";
import { ENV } from "../config/env";

/**
 * Enterprise Request ID Middleware
 * Assigns a unique correlation ID for end-to-end distributed tracing.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  (req as any).id = incomingId;
  (req as any).requestId = incomingId;
  res.setHeader("X-Request-Id", incomingId);
  next();
};

/**
 * Enterprise CORS Middleware
 * Whitelists configured origins, localhost dev environments, and allows server-to-server calls.
 */
const allowedOrigins = (ENV.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permit requests with no origin (curl, mobile native clients, cron, SSR)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      (ENV.NODE_ENV !== "production" && origin.includes("vocalytics.ai"));

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked request from untrusted origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "Accept"],
  maxAge: 86400, // Cache preflight response for 24 hours
});

/**
 * Enterprise Helmet Middleware
 * Secures HTTP response headers with tuning for Web Audio APIs and AudioContext blobs.
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Permitted for Web Audio API & AudioContext blob streams
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
});

/**
 * NoSQL Injection Sanitization Function
 * Recursively removes keys starting with '$' or containing '.' from objects.
 */
const sanitizeObject = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip operators starting with $ (e.g. $gt, $where, $ne) or containing dot notation
    if (!key.startsWith("$") && !key.includes(".")) {
      cleaned[key] = sanitizeObject(value);
    }
  }
  return cleaned;
};

/**
 * Enterprise NoSQL Injection Defense Middleware
 */
export const noSqlSanitizerMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * HTTP Parameter Pollution (HPP) defense middleware
 * Prevents array pollution in query parameters unless explicitly permitted
 */
export const parameterPollutionMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.query && typeof req.query === "object") {
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        // Keep the last supplied parameter value to prevent pollution exploits
        req.query[key] = value[value.length - 1];
      }
    }
  }
  next();
};

/**
 * Additional Custom Security Response Headers
 */
export const securityHeadersMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "microphone=(self), camera=()");
  next();
};

/**
 * Pre-body Security Middleware Suite
 * Headers, request ID, CORS, and Helmet defenses (before body parsing).
 */
export const preBodySecurityMiddleware: RequestHandler[] = [
  requestIdMiddleware,
  helmetMiddleware,
  corsMiddleware,
  securityHeadersMiddleware,
];

/**
 * Post-body Sanitization Middleware Suite
 * Input sanitization that requires parsed req.body, req.query, and req.params.
 */
export const postBodySecurityMiddleware: RequestHandler[] = [
  noSqlSanitizerMiddleware,
  parameterPollutionMiddleware,
];

/**
 * Composite Security Middleware
 * Preserved for backward compatibility and monolithic mounting.
 */
export const securityMiddleware: RequestHandler[] = [
  ...preBodySecurityMiddleware,
  ...postBodySecurityMiddleware,
];

export default securityMiddleware;
