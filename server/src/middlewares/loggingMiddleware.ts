import morgan from "morgan";
import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger";
import { ENV } from "../config/env";

/**
 * Configure Morgan tokens for distributed tracing and context
 */
morgan.token("req-id", (req: Request) => {
  return (req as any).id || (req as any).requestId || (req.headers["x-request-id"] as string) || "-";
});

morgan.token("user-id", (req: Request) => {
  return (req as any).user?.id || (req as any).user?._id?.toString() || "anonymous";
});

morgan.token("real-ip", (req: Request) => {
  return req.ip || req.socket?.remoteAddress || "-";
});

// Stream morgan output directly to application Logger
const morganStream = {
  write: (message: string) => {
    Logger.http(message.trim());
  },
};

// Formats for different environments
const devFormat = ":method :url :status :response-time ms - reqId: :req-id user: :user-id";
const prodFormat = JSON.stringify({
  timestamp: ":date[iso]",
  method: ":method",
  url: ":url",
  status: ":status",
  responseTimeMs: ":response-time",
  reqId: ":req-id",
  userId: ":user-id",
  ip: ":real-ip",
});

/**
 * Enterprise Request Logger Middleware
 * Integrates Morgan with structured Winston/application logging and request ID correlation.
 */
export const requestLogger = morgan(ENV.NODE_ENV === "production" ? prodFormat : devFormat, {
  stream: morganStream,
  skip: (req: Request, _res: Response) => {
    // Skip logging during test runs or for high-frequency health probes in production
    if (ENV.NODE_ENV === "test") return true;
    if (ENV.NODE_ENV === "production" && (req.originalUrl.startsWith("/health") || req.originalUrl.startsWith("/ready"))) {
      return true;
    }
    return false;
  },
});

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  return requestLogger(req, res, next);
};

export default loggingMiddleware;
