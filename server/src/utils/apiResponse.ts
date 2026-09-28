import { Response } from "express";
import { ApiResponseEnvelope, PaginatedResult } from "../types/common.types";

/**
 * Enterprise Centralized Response Formatter
 * Guarantees a consistent JSON structure across all API endpoints:
 * {
 *   success: boolean;
 *   message?: string;
 *   data?: T;
 *   error?: { code: string; message: string; details?: any; stack?: string };
 *   meta?: { timestamp: string; requestId?: string; pagination?: any; ... };
 * }
 */
export class ApiResponse {
  private static getBaseMeta(res?: Response, additionalMeta?: Record<string, any>): Record<string, any> {
    const meta: Record<string, any> = {
      timestamp: new Date().toISOString(),
      ...(additionalMeta || {}),
    };

    if (res) {
      const req = (res as any).req;
      const requestId =
        req?.id ||
        req?.requestId ||
        (typeof res.getHeader === "function" ? res.getHeader("X-Request-Id") : undefined);
      if (requestId) {
        meta.requestId = String(requestId);
      }
    }

    return meta;
  }

  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200,
    meta?: Record<string, any>
  ): Response {
    const responsePayload: ApiResponseEnvelope<T> = {
      success: true,
      message,
      data,
      meta: this.getBaseMeta(res, meta),
    };
    return res.status(statusCode).json(responsePayload);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = "Resource created successfully",
    meta?: Record<string, any>
  ): Response {
    return this.success(res, data, message, 201, meta);
  }

  static paginated<T>(
    res: Response,
    result: PaginatedResult<T>,
    message?: string,
    meta?: Record<string, any>
  ): Response {
    const responsePayload: ApiResponseEnvelope<T[]> = {
      success: true,
      message,
      data: result.data,
      meta: this.getBaseMeta(res, {
        pagination: result.pagination,
        ...(meta || {}),
      }),
    };
    return res.status(200).json(responsePayload);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static error(
    res: Response,
    message: string = "An error occurred",
    statusCode: number = 500,
    code: string = "INTERNAL_SERVER_ERROR",
    details?: any,
    meta?: Record<string, any>,
    stack?: string
  ): Response {
    const responsePayload: ApiResponseEnvelope = {
      success: false,
      error: {
        code,
        message,
        details,
        ...(stack ? { stack } : {}),
      },
      meta: this.getBaseMeta(res, meta),
    };
    return res.status(statusCode).json(responsePayload);
  }
}
