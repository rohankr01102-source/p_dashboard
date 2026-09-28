import { Router } from "express";
import { container } from "../config/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { aiAnalysisLimiter } from "../middlewares/rateLimiterMiddleware";

const router = Router();
const { analysisController } = container;

// All analysis endpoints require authentication
router.use(authMiddleware);

// Get intonation analysis summary
router.get("/intonation", analysisController.getIntonationSummary);

// Get progress timeline
router.get("/timeline", analysisController.getProgressTimeline);

// Get all analyses for current user
router.get("/history", analysisController.getUserAnalyses);

// Get analysis for a specific recording
router.get("/recording/:recordingId", analysisController.getAnalysisByRecording);

// Trigger on-demand analysis for a recording
router.post("/:recordingId", aiAnalysisLimiter, analysisController.triggerAnalysis);

export default router;
