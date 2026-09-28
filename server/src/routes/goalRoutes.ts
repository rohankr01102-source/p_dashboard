import { Router } from "express";
import { container } from "../config/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const { goalController } = container;

// All goal endpoints require authentication
router.use(authMiddleware);

// List user goals
router.get("/", goalController.getUserGoals);

// Create new goal
router.post("/", goalController.createGoal);

// Get single goal by ID
router.get("/:id", goalController.getGoalById);

// Update goal
router.put("/:id", goalController.updateGoal);

// Toggle goal completion status
router.patch("/:id/toggle", goalController.toggleGoal);

// Delete goal
router.delete("/:id", goalController.deleteGoal);

export default router;
