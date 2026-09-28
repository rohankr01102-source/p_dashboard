import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { achievementEngine } from "../services/AchievementEngine";

export const getAchievements = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required to fetch achievements.", 401, "UNAUTHORIZED");
      return;
    }

    const { achievements, newlyUnlocked, totalPoints, unlockedCount } =
      await achievementEngine.evaluateAchievements(userId);

    const total = achievements.length;
    const unlockedPercentage = Math.round((unlockedCount / Math.max(1, total)) * 100);

    ApiResponse.success(res, {
      total,
      unlockedCount,
      unlockedPercentage,
      totalPoints,
      newlyUnlocked,
      achievements,
    });
  }
);

export const evaluateAchievements = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const result = await achievementEngine.evaluateAchievements(userId);
    ApiResponse.success(res, result, "Achievements evaluated successfully.");
  }
);
