import { Router } from "express";
import {
  getReports,
  generateReport,
  getEmailPreview,
  sendEmailSummary,
} from "../controllers/reportController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.get("/", getReports);
router.post("/generate", generateReport);
router.get("/email-preview", getEmailPreview);
router.post("/send-email-summary", sendEmailSummary);

export default router;
