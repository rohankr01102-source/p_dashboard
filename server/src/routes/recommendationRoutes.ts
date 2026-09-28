import { Router } from "express";
import { getSmartRecommendations } from "../controllers/recommendationController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.get("/", getSmartRecommendations);
router.get("/smart", getSmartRecommendations);

export default router;
