import { Router } from "express";
import { container } from "../config/container";
import { authMiddleware } from "../middlewares/authMiddleware";
import { singleAudioUploadMiddleware } from "../middlewares/uploadMiddleware";
import { uploadLimiter } from "../middlewares/rateLimiterMiddleware";

const router = Router();
const { recordingController } = container;

// Upload audio take (strictly authenticated)
router.post("/upload", uploadLimiter, authMiddleware, singleAudioUploadMiddleware, recordingController.uploadRecording);
router.post("/", uploadLimiter, authMiddleware, singleAudioUploadMiddleware, recordingController.uploadRecording);

// Retrieve storage metrics
router.get("/stats/storage", authMiddleware, recordingController.getStorageStats);

// Stream audio track (range request support)
router.get("/stream/:filename", recordingController.streamAudio);

// List user recordings
router.get("/", authMiddleware, recordingController.getAllRecordings);

// Get single recording by ID
router.get("/:id", authMiddleware, recordingController.getRecordingById);

// Update recording metadata
router.put("/:id", authMiddleware, recordingController.updateRecording);

// Delete recording
router.delete("/:id", authMiddleware, recordingController.deleteRecording);

export default router;
