import { Request } from "express";
import { UnauthorizedError } from "./appError";

/**
 * Extracts the authenticated user's ID from an Express request.
 * Resiliently falls back between Mongoose _id and plain object id.
 * Throws UnauthorizedError if no authenticated user is present.
 */
export function getUserIdFromRequest(req: Request | any): string {
  const userId = req.user?._id?.toString() || req.user?.id?.toString();
  if (!userId) {
    throw new UnauthorizedError("Authentication required.");
  }
  return userId;
}
