import { Request, Response } from "express";
import { IDashboardService } from "../interfaces/IService.interface";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { UnauthorizedError } from "../utils/appError";

export class DashboardController {
  constructor(private readonly dashboardService: IDashboardService) {}

  private getAuthUserId(req: Request): string {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }
    return userId;
  }

  getOverview = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const data = await this.dashboardService.getOverview(userId);
    return ApiResponse.success(res, data, "Dashboard metrics retrieved successfully.");
  });

  getSkillRadar = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const radar = await this.dashboardService.getSkillRadar(userId);
    return ApiResponse.success(res, radar, "Skill radar metrics retrieved.");
  });

  getPracticeTrends = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const days = parseInt(req.query.days as string, 10) || 7;

    const trends = await this.dashboardService.getPracticeTrends(userId, days);
    return ApiResponse.success(res, trends, "Practice trends retrieved.");
  });

  getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const activity = await this.dashboardService.getRecentActivity(userId, limit);
    return ApiResponse.success(res, activity, "Recent activity retrieved.");
  });
}
