import { Router } from "express";
import {
  uploadAndAnalyze,
  getAllSessions,
  getSessionById,
  deleteSession,
  updateNotes,
} from "../controllers/sessionController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { singleAudioUploadMiddleware } from "../middlewares/uploadMiddleware";
import { uploadLimiter } from "../middlewares/rateLimiterMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/upload", uploadLimiter, singleAudioUploadMiddleware, uploadAndAnalyze);
router.get("/", getAllSessions);
router.get("/:id", getSessionById);
router.delete("/:id", deleteSession);
router.patch("/:id/notes", updateNotes);

export default router;
