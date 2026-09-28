import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType =
  | "PRACTICE_REMINDER"
  | "GOAL_ACHIEVED"
  | "ANALYSIS_READY"
  | "STREAK_WARNING"
  | "BADGE_UNLOCKED"
  | "FEEDBACK_RECEIVED"
  | "SYSTEM_ANNOUNCEMENT"
  | "SYSTEM_ALERT"
  | "REMINDER";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  timeAgo: string;
}

export interface NotificationModel extends Model<INotification> {
  getUnreadCount(userId: string | mongoose.Types.ObjectId): Promise<number>;
  markAllAsRead(userId: string | mongoose.Types.ObjectId): Promise<{ modifiedCount: number }>;
  getNotificationSummary(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{
    unreadCount: number;
    totalCount: number;
    breakdownByType: Array<{ _id: string; count: number }>;
  }>;
}

const NotificationSchema = new Schema<INotification, NotificationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must belong to a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    type: {
      type: String,
      enum: {
        values: [
          "PRACTICE_REMINDER",
          "GOAL_ACHIEVED",
          "ANALYSIS_READY",
          "STREAK_WARNING",
          "BADGE_UNLOCKED",
          "FEEDBACK_RECEIVED",
          "SYSTEM_ANNOUNCEMENT",
          "SYSTEM_ALERT",
          "REMINDER",
        ],
        message: "{VALUE} is not a recognized notification type",
      },
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
      trim: true,
      maxlength: [255, "Action URL cannot exceed 255 characters"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30-day retention
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// High-speed compound indexes
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });
// TTL index for automatic expiry
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtuals
NotificationSchema.virtual("timeAgo").get(function (this: INotification) {
  if (!this.createdAt) return "just now";
  const seconds = Math.floor((Date.now() - this.createdAt.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
});

// Pre-save hook: auto-set readAt when isRead flips to true
NotificationSchema.pre<INotification>("save", function (next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static Methods
NotificationSchema.statics.getUnreadCount = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  return await this.countDocuments({ userId: userObjectId, isRead: false });
};

NotificationSchema.statics.markAllAsRead = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const result = await this.updateMany(
    { userId: userObjectId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return { modifiedCount: result.modifiedCount };
};

NotificationSchema.statics.getNotificationSummary = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const [summary] = await this.aggregate([
    { $match: { userId: userObjectId } },
    {
      $facet: {
        counts: [
          {
            $group: {
              _id: null,
              totalCount: { $sum: 1 },
              unreadCount: {
                $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] },
              },
            },
          },
        ],
        byType: [
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

  const countRow = summary?.counts?.[0] || { totalCount: 0, unreadCount: 0 };
  return {
    unreadCount: countRow.unreadCount,
    totalCount: countRow.totalCount,
    breakdownByType: summary?.byType || [],
  };
};

NotificationSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Notification = mongoose.model<INotification, NotificationModel>(
  "Notification",
  NotificationSchema
);
