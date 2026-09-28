import { Request, Response } from "express";
import { IUserService } from "../interfaces/IService.interface";
import { UserValidators } from "../validators/userValidators";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { UnauthorizedError } from "../utils/appError";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  private getAuthUserId(req: Request): string {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }
    return userId;
  }

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const profile = await this.userService.getProfile(userId);
    return ApiResponse.success(res, profile, "User profile retrieved.");
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const validatedData = UserValidators.validateProfileUpdate(req.body);

    const updated = await this.userService.updateProfile(userId, validatedData);
    return ApiResponse.success(res, updated, "User profile updated successfully.");
  });

  updatePreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const validatedData = UserValidators.validatePreferencesUpdate(req.body);
    const updated = await this.userService.updatePreferences(userId, validatedData);
    return ApiResponse.success(res, updated, "Preferences updated successfully.");
  });

  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const stats = await this.userService.getUserStats(userId);
    return ApiResponse.success(res, stats, "User statistics retrieved.");
  });

  getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const leaderboard = await this.userService.getLeaderboard(limit);
    return ApiResponse.success(res, leaderboard, "Leaderboard retrieved.");
  });

  getEmailPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const { emailSummaryService } = await import("../services/EmailSummaryService");
    const prefs = await emailSummaryService.getPreferences(userId);
    return ApiResponse.success(res, prefs, "Email preferences retrieved.");
  });

  updateEmailPreferences = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const { emailSummaryService } = await import("../services/EmailSummaryService");
    const updated = await emailSummaryService.updatePreferences(userId, req.body);
    return ApiResponse.success(res, updated, "Email preferences updated successfully.");
  });
}

