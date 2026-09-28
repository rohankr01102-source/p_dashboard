import { Request, Response, NextFunction, RequestHandler } from "express";
import { ValidationError } from "../utils/appError";

export type ValidatorFunction<T = any> = (data: any) => T;

export interface SchemaValidator {
  validate?: (data: any, options?: any) => { error?: any; value?: any };
  parse?: (data: any) => any;
  safeParse?: (data: any) => { success: boolean; data?: any; error?: any };
}

export type ValidatorType = ValidatorFunction | SchemaValidator;

export interface ValidationSchema {
  body?: ValidatorType;
  query?: ValidatorType;
  params?: ValidatorType;
  headers?: ValidatorType;
}

/**
 * Executes a validator against target data, handling function, Joi, or Zod schemas
 */
const runValidator = (validator: ValidatorType, data: any): any => {
  // 1. Zod schema support (.safeParse)
  if (typeof (validator as any).safeParse === "function") {
    const result = (validator as any).safeParse(data);
    if (!result.success) {
      const details: Record<string, string> = {};
      if (result.error?.issues) {
        for (const issue of result.error.issues) {
          const field = issue.path.join(".") || "root";
          details[field] = issue.message;
        }
      }
      throw new ValidationError("Input validation failed.", details);
    }
    return result.data;
  }

  // 2. Joi schema support (.validate)
  if (typeof (validator as any).validate === "function") {
    const result = (validator as any).validate(data, { abortEarly: false, stripUnknown: false });
    if (result.error) {
      const details: Record<string, string> = {};
      if (result.error.details) {
        for (const d of result.error.details) {
          const key = d.path.join(".") || "field";
          details[key] = d.message;
        }
      }
      throw new ValidationError("Input validation failed.", details);
    }
    return result.value;
  }

  // 3. Functional validator support (throws error or returns validated/sanitized object)
  if (typeof validator === "function") {
    return validator(data);
  }

  return data;
};

/**
 * Enterprise Request Validation Middleware
 * Validates body, query, and params against provided schemas or validator functions.
 */
export const validateRequest = (schema: ValidationSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = runValidator(schema.body, req.body);
      }
      if (schema.query) {
        req.query = runValidator(schema.query, req.query);
      }
      if (schema.params) {
        req.params = runValidator(schema.params, req.params);
      }
      if (schema.headers) {
        runValidator(schema.headers, req.headers);
      }
      next();
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return next(error);
      }
      // If validator threw a raw Error, wrap it cleanly into ValidationError
      const message = error.message || "Request validation failed.";
      const details = error.details || { general: message };
      next(new ValidationError(message, details));
    }
  };
};

/**
 * Helper to validate request body
 */
export const validateBody = (validator: ValidatorType): RequestHandler => {
  return validateRequest({ body: validator });
};

/**
 * Helper to validate query parameters
 */
export const validateQuery = (validator: ValidatorType): RequestHandler => {
  return validateRequest({ query: validator });
};

/**
 * Helper to validate route parameters
 */
export const validateParams = (validator: ValidatorType): RequestHandler => {
  return validateRequest({ params: validator });
};

export default validateRequest;
