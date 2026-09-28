import { Request, Response } from "express";
import { INotificationService } from "../interfaces/IService.interface";
import { NotificationValidators } from "../validators/notificationValidators";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { UnauthorizedError } from "../utils/appError";

export class NotificationController {
  constructor(private readonly notificationService: INotificationService) {}

  private getAuthUserId(req: Request): string {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }
    return userId;
  }

  getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const limit = parseInt(req.query.limit as string, 10) || 30;

    const notifs = await this.notificationService.getUserNotifications(userId, limit);
    return ApiResponse.success(res, notifs, "Notifications retrieved.");
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const count = await this.notificationService.getUnreadCount(userId);
    return ApiResponse.success(res, { unreadCount: count }, "Unread notification count retrieved.");
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    NotificationValidators.validateId(id);

    const userId = this.getAuthUserId(req);
    await this.notificationService.markAsRead(id, userId);

    return ApiResponse.success(res, { id, read: true }, "Notification marked as read.");
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = this.getAuthUserId(req);
    const modifiedCount = await this.notificationService.markAllAsRead(userId);

    return ApiResponse.success(res, { count: modifiedCount }, "All notifications marked as read.");
  });
}
