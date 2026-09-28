import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController";

const router = Router();

router.use(authMiddleware);

router.get("/", getSchedules);
router.post("/", createSchedule);
router.patch("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

export default router;
