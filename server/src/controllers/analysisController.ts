import { Request, Response } from "express";
import { IAnalysisService } from "../interfaces/IService.interface";
import { AnalysisValidators } from "../validators/analysisValidators";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, UnauthorizedError } from "../utils/appError";

export class AnalysisController {
  constructor(private readonly analysisService: IAnalysisService) {}

  private getAuthUserId(req: Request): string {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }
    return userId;
  }

  triggerAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const recordingId = req.params.recordingId as string;
    AnalysisValidators.validateRecordingId(recordingId);

    const userId = this.getAuthUserId(req);
    const analysis = await this.analysisService.analyzeRecording(recordingId, userId);

    return ApiResponse.created(res, analysis, "Vocal analysis processed successfully.");
  });

  getAnalysisByRecording = asyncHandler(async (req: Request, res: Response) => {
    const recordingId = req.params.recordingId as string;
    AnalysisValidators.validateRecordingId(recordingId);

    const userId = this.getAuthUserId(req);
    const analysis = await this.analysisService.getAnalysisByRecording(recordingId, userId);

    if (!analysis) {
      throw new NotFoundError("Analysis not found for this recording take.");
    }

    return ApiResponse.success(res, analysis, "Analysis retrieved successfully.");
  });

  getUserAnalyses = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const analyses = await this.analysisService.getUserAnalyses(userId, limit);
    return ApiResponse.success(res, analyses, "Analyses retrieved successfully.");
  });

  getIntonationSummary = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const summary = await this.analysisService.getIntonationSummary(userId);
    return ApiResponse.success(res, summary, "Intonation summary retrieved.");
  });

  getProgressTimeline = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const { days } = AnalysisValidators.validateTimelineQuery(req.query);

    const timeline = await this.analysisService.getProgressTimeline(userId, days);
    return ApiResponse.success(res, timeline, "Progress timeline retrieved.");
  });
}
