import { Router } from "express";
import { container } from "../config/container";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const { notificationController } = container;

// All notification endpoints require authentication
router.use(authMiddleware);

// List notifications
router.get("/", notificationController.getNotifications);

// Unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark single notification read
router.patch("/:id/read", notificationController.markAsRead);

// Mark all notifications read
router.post("/read-all", notificationController.markAllAsRead);

export default router;
