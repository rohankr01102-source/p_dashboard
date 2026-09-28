import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { streakService } from "../services/StreakService";

export const getStreakStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const status = await streakService.getStreakStatus(userId);
    ApiResponse.success(res, status, "Practice streak status retrieved successfully.");
  }
);

export const activateStreakFreeze = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const result = await streakService.useStreakFreeze(userId);
    if (!result.success) {
      ApiResponse.error(res, result.message, 400, "FREEZE_UNAVAILABLE");
      return;
    }

    ApiResponse.success(res, result, result.message);
  }
);
