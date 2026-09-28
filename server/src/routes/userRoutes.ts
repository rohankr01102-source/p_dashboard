import { Router } from "express";
import { container } from "../config/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const { userController } = container;

// Public leaderboard
router.get("/leaderboard", userController.getLeaderboard);

// Authenticated user profile routes
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);

// Authenticated preferences & stats
router.patch("/preferences", authMiddleware, userController.updatePreferences);
router.put("/preferences", authMiddleware, userController.updatePreferences);
router.get("/stats", authMiddleware, userController.getUserStats);

export default router;
