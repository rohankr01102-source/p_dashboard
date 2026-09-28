export type NotificationType =
  | "ANALYSIS_READY"
  | "GOAL_ACHIEVED"
  | "STREAK_MILESTONE"
  | "FEEDBACK_RECEIVED"
  | "SYSTEM_ALERT"
  | "REMINDER";

export interface INotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
