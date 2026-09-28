import { Router } from "express";
import { container } from "../config/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const { dashboardController } = container;

// All dashboard endpoints require authentication
router.use(authMiddleware);

// Comprehensive dashboard overview
router.get("/overview", dashboardController.getOverview);
router.get("/", dashboardController.getOverview);

// 6-axis skill geometry radar
router.get("/radar", dashboardController.getSkillRadar);

// Practice volume trends
router.get("/trends", dashboardController.getPracticeTrends);

// Recent activity feed
router.get("/activity", dashboardController.getRecentActivity);

export default router;
