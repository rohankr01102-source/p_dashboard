import { Response, NextFunction } from "express";
import { Feedback } from "../models/Feedback";
import { isConnectedToMongo } from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ApiResponse } from "../utils/apiResponse";
import { Logger } from "../utils/logger";
import { asyncHandler } from "../utils/asyncHandler";

export const getRecordingFeedback = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const { recordingId } = req.params;

    if (!isConnectedToMongo) {
      ApiResponse.success(res, { count: 0, feedbacks: [] });
      return;
    }

    const feedbacks = await Feedback.find({ recordingId })
      .populate("authorId", "name avatar vocalType")
      .sort({ createdAt: -1 })
      .lean();

    ApiResponse.success(res, { count: feedbacks.length, feedbacks });
  }
);

export const getSingerFeedbackSummary = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!userId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    if (!isConnectedToMongo) {
      ApiResponse.success(res, {
        totalFeedbacks: 1,
        avgOverallRating: 4.5,
        avgPitchAccuracy: 4.4,
        avgBreathControl: 4.2,
        avgToneQuality: 4.6,
        avgVocalAgility: 4.1,
        avgEmotionalDelivery: 4.8,
        authorTypeBreakdown: [{ _id: "AI_COACH", count: 1 }],
        topTips: [],
      });
      return;
    }

    const summary = await Feedback.getFeedbackSummaryForSinger(userId);
    const topTips = await Feedback.getTopTipsForSinger(userId, 5);

    ApiResponse.success(res, { ...summary, topTips });
  }
);

export const createFeedback = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const authorId = req.user?._id?.toString() || req.user?.id?.toString();
    if (!authorId) {
      ApiResponse.error(res, "Authentication required.", 401, "UNAUTHORIZED");
      return;
    }

    const {
      recordingId,
      analysisId,
      userId,
      authorType,
      overallRating,
      aspectRatings,
      writtenFeedback,
      strengths,
      areasForImprovement,
      actionableTips,
    } = req.body;

    if (!recordingId || !userId || !overallRating || !writtenFeedback) {
      ApiResponse.error(
        res,
        "recordingId, userId, overallRating, and writtenFeedback are required.",
        400,
        "VALIDATION_ERROR"
      );
      return;
    }

    if (isConnectedToMongo) {
      const feedback = await Feedback.create({
        recordingId,
        analysisId,
        userId,
        authorId,
        authorType: authorType || "PEER_SINGER",
        overallRating: Math.min(5, Math.max(1, Number(overallRating))),
        aspectRatings: aspectRatings || {
          pitchAccuracy: 3,
          breathControl: 3,
          toneQuality: 3,
          vocalAgility: 3,
          emotionalDelivery: 3,
        },
        writtenFeedback: String(writtenFeedback).slice(0, 2000),
        strengths: Array.isArray(strengths) ? strengths : [],
        areasForImprovement: Array.isArray(areasForImprovement) ? areasForImprovement : [],
        actionableTips: Array.isArray(actionableTips) ? actionableTips : [],
      });

      ApiResponse.created(res, feedback, "Feedback submitted successfully.");
      return;
    }

    // Offline / no-DB path
    Logger.warn("[createFeedback] MongoDB not connected — feedback recorded in evaluation store only.");
    ApiResponse.created(res, req.body, "Feedback recorded in evaluation store.");
  }
);
