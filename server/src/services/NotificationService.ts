import { INotificationService } from "../interfaces/IService.interface";
import { INotificationRepository } from "../interfaces/IRepository.interface";
import { INotificationEntity, NotificationType } from "../interfaces/INotification.interface";
import { Logger } from "../utils/logger";

export class NotificationService implements INotificationService {
  constructor(private readonly notifRepo: INotificationRepository) {}

  async getUserNotifications(userId: string, limit: number = 30): Promise<INotificationEntity[]> {
    return this.notifRepo.findByUserId(userId, limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.getUnreadCount(userId);
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    return this.notifRepo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.notifRepo.markAllAsRead(userId);
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<INotificationEntity> {
    const notif = await this.notifRepo.create({
      userId,
      title,
      message,
      type: type as NotificationType,
      read: false,
      link,
      metadata,
    });
    Logger.info(`Notification sent to user ${userId}: ${title}`);
    return notif;
  }
}
