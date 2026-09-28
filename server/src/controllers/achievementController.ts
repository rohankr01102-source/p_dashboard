import { Response, NextFunction } from "express";
import { memoryStore } from "../services/store";
import { Achievement } from "../models/Achievement";
import { isConnectedToMongo } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { Logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

export const getAchievements = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required to fetch achievements.", 401, "UNAUTHORIZED");
      return;
    }

    let achievements = memoryStore.achievements.filter(
      (a) => a.userId.toString() === userId.toString()
    );

    if (isConnectedToMongo) {
      try {
        const dbAchievements = await Achievement.find({ userId }).lean();
        if (dbAchievements && dbAchievements.length > 0) {
          achievements = dbAchievements as typeof achievements;
        }
      } catch (e) {
        Logger.warn("[getAchievements] MongoDB query failed, falling back to memoryStore", e);
      }
    }

    const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

    ApiResponse.success(res, {
      total: achievements.length,
      unlockedCount,
      unlockedPercentage: Math.round(
        (unlockedCount / Math.max(1, achievements.length)) * 100
      ),
      achievements,
    });
  }
);
