import { Router } from "express";
import { getMonthCalendar } from "../controllers/calendarController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.use(authMiddleware);

router.get("/", getMonthCalendar);
router.get("/month", getMonthCalendar);

export default router;
