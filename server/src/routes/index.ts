import { Router } from "express";

import authRoutes from "./authRoutes";
import recordingRoutes from "./recordingRoutes";
import analysisRoutes from "./analysisRoutes";
import goalRoutes from "./goalRoutes";
import dashboardRoutes from "./dashboardRoutes";
import userRoutes from "./userRoutes";
import notificationRoutes from "./notificationRoutes";

// Complementary feature routes
import sessionRoutes from "./sessionRoutes";
import analyticsRoutes from "./analyticsRoutes";
import achievementRoutes from "./achievementRoutes";
import reportRoutes from "./reportRoutes";
import feedbackRoutes from "./feedbackRoutes";
import playlistRoutes from "./playlistRoutes";
import scheduleRoutes from "./scheduleRoutes";

const router = Router();

// Core MVC Architecture Routes
router.use("/auth", authRoutes);
router.use("/recordings", recordingRoutes);
router.use("/analysis", analysisRoutes);
router.use("/goals", goalRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);

// Complementary & Client-Integration Routes
router.use("/sessions", sessionRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/achievements", achievementRoutes);
router.use("/reports", reportRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/playlists", playlistRoutes);
router.use("/schedules", scheduleRoutes);

export default router;
