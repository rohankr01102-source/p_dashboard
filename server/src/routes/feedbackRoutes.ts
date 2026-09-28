import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getRecordingFeedback,
  getSingerFeedbackSummary,
  createFeedback,
} from "../controllers/feedbackController";

const router = Router();

router.use(authMiddleware);

router.get("/summary", getSingerFeedbackSummary);
router.get("/recording/:recordingId", getRecordingFeedback);
router.post("/", createFeedback);

export default router;
