import { Router } from "express";
import { getStreakStatus, activateStreakFreeze } from "../controllers/streakController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.get("/", getStreakStatus);
router.get("/status", getStreakStatus);
router.post("/freeze", activateStreakFreeze);

export default router;
