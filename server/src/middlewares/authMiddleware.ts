import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtUtil } from "../utils/jwt";
import { UnauthorizedError } from "../utils/appError";
import { User } from "../models/User";
import { memoryStore } from "../services/store";
import { isConnectedToMongo } from "../config/db";

export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

/**
 * Enterprise Authentication Middleware
 * Validates Bearer JWTs, checks expiration and revokation,
 * and attaches verified user entity and token to the request.
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authentication token missing. Please sign in or provide a valid Bearer token.",
        { code: "TOKEN_MISSING" }
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedError("Malformed Bearer authorization header.", { code: "TOKEN_MALFORMED" });
    }

    let decoded: any;
    try {
      decoded = JwtUtil.verify(token);
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError || err.name === "TokenExpiredError") {
        throw new UnauthorizedError("Authentication token has expired. Please sign in again.", {
          code: "TOKEN_EXPIRED",
          expiredAt: err.expiredAt,
        });
      }
      throw new UnauthorizedError("Invalid or corrupted authentication token.", {
        code: "INVALID_TOKEN",
      });
    }

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication token payload is invalid.", { code: "INVALID_PAYLOAD" });
    }

    let user: any = null;
    if (isConnectedToMongo) {
      try {
        user = await User.findById(userId).select("-password").lean();
      } catch (dbErr) {
        // Fallback to memory store if DB lookup encounters an issue
      }
    }

    if (!user) {
      user = memoryStore.users.find(
        (u) => u._id?.toString() === userId.toString() || u.id?.toString() === userId.toString()
      );
    }

    if (!user) {
      throw new UnauthorizedError("The user associated with this token no longer exists.", {
        code: "USER_NOT_FOUND",
      });
    }

    // Normalize user id for consistent downstream access
    if (user) {
      user.id = user._id ? user._id.toString() : (user.id || userId.toString());
    }

    // Attach user entity and raw token to request context
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Soft-authenticates if a valid Bearer token is provided without failing the request
 * if unauthenticated. Ideal for public routes that offer enriched data to signed-in users.
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token) {
        try {
          const decoded: any = JwtUtil.verify(token);
          const userId = decoded.id || decoded.userId;

          let user: any = null;
          if (isConnectedToMongo && userId) {
            try {
              user = await User.findById(userId).select("-password").lean();
            } catch {}
          }

          if (!user && userId) {
            user = memoryStore.users.find(
              (u) => u._id?.toString() === userId.toString() || u.id?.toString() === userId.toString()
            );
          }

          if (user) {
            user.id = user._id ? user._id.toString() : (user.id || userId.toString());
            req.user = user;
            req.token = token;
          }
        } catch {
          // Soft ignore invalid/expired tokens on optional endpoints
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Aliases for modern naming conventions
export const requireAuth = authMiddleware;
export const optionalAuth = optionalAuthMiddleware;
