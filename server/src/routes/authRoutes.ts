import { Router } from "express";
import { container } from "../config/container";
import { authMiddleware, optionalAuthMiddleware } from "../middlewares/authMiddleware";
import { authLimiter } from "../middlewares/rateLimiterMiddleware";

const router = Router();
const { authController } = container;

// Public auth endpoints
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/demo", authLimiter, authController.getDemoToken);
router.post("/demo", authLimiter, authController.getDemoToken);
router.post("/logout", authController.logout);

// Protected auth endpoints
router.get("/me", authMiddleware, authController.getCurrentUser);
router.get("/status", optionalAuthMiddleware, authController.getCurrentUser);

export default router;
