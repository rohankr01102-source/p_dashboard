import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { JwtPayload } from "../types/auth.types";
import { UnauthorizedError } from "./appError";

/**
 * Enterprise JWT Utility
 * Strictly enforces HS256 algorithm to prevent algorithm confusion attacks.
 */
export class JwtUtil {
  static sign(payload: JwtPayload, expiresIn: string = ENV.JWT_EXPIRES_IN): string {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: expiresIn as any,
    });
  }

  static verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, ENV.JWT_SECRET, {
        algorithms: ["HS256"],
      }) as JwtPayload;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedError("Authentication token has expired. Please sign in again.", {
          code: "TOKEN_EXPIRED",
          expiredAt: err.expiredAt,
        });
      }
      throw new UnauthorizedError("Invalid or corrupted authentication token.", {
        code: "INVALID_TOKEN",
      });
    }
  }

  static decode(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }
}
