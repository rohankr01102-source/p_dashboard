import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/appError";

export interface OwnershipOptions {
  paramKey?: string;
  allowRoles?: string[];
  userField?: string;
}

/**
 * Enterprise Authorization Middleware (RBAC & ABAC)
 * Provides fine-grained role-based access control and resource ownership validation.
 */

/**
 * Enforces that the authenticated user possesses at least one of the required roles.
 * @param allowedRoles Allowed roles (e.g. 'admin', 'coach', 'user')
 */
export const requireRole = (...allowedRoles: string[]) => {
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new UnauthorizedError("Authentication is required before checking authorization privileges.", {
          code: "AUTH_REQUIRED",
        })
      );
    }

    const userRole = (req.user.role || "user").toLowerCase();

    if (!normalizedAllowed.includes(userRole)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role || "user"}' does not have permission to perform this action. Required role(s): ${allowedRoles.join(", ")}`,
          {
            code: "FORBIDDEN_ROLE",
            userRole: req.user.role || "user",
            requiredRoles: allowedRoles,
          }
        )
      );
    }

    next();
  };
};

/**
 * Array-based alias for requireRole
 */
export const requireAnyRole = (allowedRoles: string[]) => requireRole(...allowedRoles);

/**
 * Enforces resource ownership. Verifies that the route parameter matches the user's ID,
 * or allows privileged roles (e.g., 'admin') to bypass.
 */
export const requireOwnership = (options: string | OwnershipOptions = "id") => {
  const config: OwnershipOptions = typeof options === "string" ? { paramKey: options } : options;
  const paramKey = config.paramKey || "id";
  const allowRoles = (config.allowRoles || ["admin"]).map((r) => r.toLowerCase());
  const userField = config.userField || "id";

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new UnauthorizedError("Authentication required to verify resource ownership.", {
          code: "AUTH_REQUIRED",
        })
      );
    }

    const userRole = (req.user.role || "user").toLowerCase();
    if (allowRoles.includes(userRole)) {
      // Role has administrative bypass privilege
      return next();
    }

    const currentUserId = (
      req.user[userField] ||
      req.user.id ||
      req.user._id?.toString()
    )?.toString();

    const resourceId = (req.params[paramKey] || req.body?.[paramKey])?.toString();

    if (!currentUserId || !resourceId || currentUserId !== resourceId) {
      return next(
        new ForbiddenError("Access denied. You do not have permission to access or modify this resource.", {
          code: "RESOURCE_FORBIDDEN",
        })
      );
    }

    next();
  };
};

/**
 * Convenience guard allowing self or admin
 */
export const requireSelfOrAdmin = (paramKey: string = "id") =>
  requireOwnership({ paramKey, allowRoles: ["admin"] });

/**
 * Attribute-based access control guard using a custom evaluation predicate
 */
export const requireCustomAuthorization = (
  predicate: (req: Request) => boolean | Promise<boolean>,
  failureMessage: string = "Access denied by authorization policy."
) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("Authentication required for policy evaluation."));
      }

      const isAllowed = await predicate(req);
      if (!isAllowed) {
        return next(new ForbiddenError(failureMessage, { code: "POLICY_REJECTED" }));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
