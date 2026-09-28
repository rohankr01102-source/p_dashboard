import { Router } from "express";
import { getReports, generateReport } from "../controllers/reportController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.get("/", getReports);
router.post("/generate", generateReport);

export default router;
