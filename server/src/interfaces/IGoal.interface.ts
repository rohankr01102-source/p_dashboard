export type GoalCategory =
  | "PITCH_ACCURACY"
  | "PRACTICE_TIME"
  | "RANGE_EXPANSION"
  | "VIBRATO_STABILITY"
  | "DAILY_STREAK";

export type GoalFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "ONE_OFF";

export interface IGoalEntity {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  frequency: GoalFrequency;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  isCompleted: boolean;
  completedAt?: Date;
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
