import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { smartRecommendationService } from "../services/SmartRecommendationService";

export const getSmartRecommendations = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const recommendations = await smartRecommendationService.getRecommendations(userId);
    ApiResponse.success(res, recommendations, "Smart recommendations generated successfully.");
  }
);
