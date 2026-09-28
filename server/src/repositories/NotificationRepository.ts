import { BaseRepository } from "./BaseRepository";
import { INotificationEntity, NotificationType } from "../interfaces/INotification.interface";
import { INotificationRepository } from "../interfaces/IRepository.interface";
import { Notification, INotification } from "../models/Notification";

export class NotificationRepository extends BaseRepository<INotificationEntity, INotification> implements INotificationRepository {
  private inMemoryNotifications: any[] = [];

  constructor() {
    super(Notification, []);
  }

  protected mapToEntity(doc: any): INotificationEntity {
    return {
      id: doc._id?.toString() || doc.id?.toString(),
      userId: doc.userId?.toString() || doc.user?.toString(),
      title: doc.title || "Notification",
      message: doc.message || "",
      type: (doc.type || "SYSTEM_ANNOUNCEMENT") as NotificationType,
      read: doc.isRead !== undefined ? doc.isRead : (doc.read ?? false),
      link: doc.link || doc.actionUrl,
      metadata: doc.metadata || {},
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };
  }

  async findByUserId(userId: string, limit: number = 30): Promise<INotificationEntity[]> {
    if (this.isDbAvailable()) {
      try {
        const docs = await this.model
          .find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        return docs.map((d) => this.mapToEntity(d));
      } catch (err) {}
    }

    return this.inMemoryNotifications
      .filter((n) => (n.userId || n.user)?.toString() === userId.toString())
      .slice(0, limit)
      .map((n) => this.mapToEntity(n));
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (this.isDbAvailable()) {
      try {
        return await this.model.countDocuments({ userId, isRead: false });
      } catch (err) {}
    }

    return this.inMemoryNotifications.filter(
      (n) => (n.userId || n.user)?.toString() === userId.toString() && !n.read && !n.isRead
    ).length;
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    if (this.isDbAvailable()) {
      try {
        const res = await this.model.updateOne(
          { _id: id, userId },
          { $set: { isRead: true, readAt: new Date() } }
        );
        return res.modifiedCount > 0;
      } catch (err) {}
    }

    const notif = this.inMemoryNotifications.find(
      (n) => (n._id || n.id)?.toString() === id.toString() && (n.userId || n.user)?.toString() === userId.toString()
    );
    if (notif) {
      notif.read = true;
      notif.isRead = true;
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<number> {
    if (this.isDbAvailable()) {
      try {
        const res = await this.model.updateMany(
          { userId, isRead: false },
          { $set: { isRead: true, readAt: new Date() } }
        );
        return res.modifiedCount;
      } catch (err) {}
    }

    let count = 0;
    this.inMemoryNotifications.forEach((n) => {
      if ((n.userId || n.user)?.toString() === userId.toString() && !n.read && !n.isRead) {
        n.read = true;
        n.isRead = true;
        count++;
      }
    });
    return count;
  }

  override async create(item: Partial<INotificationEntity>): Promise<INotificationEntity> {
    const isRead = (item as any).isRead ?? item.read ?? false;
    const entity = await super.create({ ...item, isRead } as any);
    this.inMemoryNotifications.unshift(entity);
    return entity;
  }
}
