import mongoose, { Schema, Document, Model } from "mongoose";

export type GoalCategory =
  | "PRACTICE_TIME"
  | "PITCH_ACCURACY"
  | "RANGE_EXPANSION"
  | "VIBRATO_STABILITY"
  | "DAILY_STREAK"
  | "REPERTOIRE";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "EXPIRED";

export type GoalPriority = "LOW" | "MEDIUM" | "HIGH";

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: GoalCategory;
  // Specific requested fields
  targetPracticeHours: number;
  targetPitchAccuracy: number;
  targetSessions: number;
  completionPercentage: number;
  // Progress tracking fields
  currentPracticeHours: number;
  currentPitchAccuracy: number;
  currentSessions: number;
  targetValue: number; // For generic value tracking compatibility
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate?: Date;
  /** @deprecated Use targetDate. Virtual getter provided for backward compatibility. */
  readonly deadline?: Date;
  status: GoalStatus;
  priority: GoalPriority;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  isOverdue: boolean;
  remainingHours: number;
  remainingSessions: number;
}

export interface GoalModel extends Model<IGoal> {
  getUserGoalAnalytics(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    avgCompletionPercentage: number;
    overdueGoals: number;
    categoryBreakdown: Array<{ _id: string; count: number; completedCount: number }>;
  }>;
}

const GoalSchema = new Schema<IGoal, GoalModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Goal must belong to a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    category: {
      type: String,
      enum: {
        values: [
          "PRACTICE_TIME",
          "PITCH_ACCURACY",
          "RANGE_EXPANSION",
          "VIBRATO_STABILITY",
          "DAILY_STREAK",
          "REPERTOIRE",
        ],
        message: "{VALUE} is not a supported goal category",
      },
      default: "PRACTICE_TIME",
      index: true,
    },
    // User requested fields
    targetPracticeHours: {
      type: Number,
      default: 0,
      min: [0, "Target practice hours cannot be negative"],
    },
    targetPitchAccuracy: {
      type: Number,
      default: 0,
      min: [0, "Target pitch accuracy cannot be negative"],
      max: [100, "Target pitch accuracy cannot exceed 100%"],
    },
    targetSessions: {
      type: Number,
      default: 0,
      min: [0, "Target sessions cannot be negative"],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, "Completion percentage cannot be negative"],
      max: [100, "Completion percentage cannot exceed 100%"],
      index: true,
    },
    // Progress Tracking
    currentPracticeHours: {
      type: Number,
      default: 0,
      min: [0, "Current practice hours cannot be negative"],
    },
    currentPitchAccuracy: {
      type: Number,
      default: 0,
      min: [0, "Current pitch accuracy cannot be negative"],
      max: [100, "Current pitch accuracy cannot exceed 100%"],
    },
    currentSessions: {
      type: Number,
      default: 0,
      min: [0, "Current sessions cannot be negative"],
    },
    targetValue: {
      type: Number,
      default: 10,
      min: [0.1, "Target value must be greater than 0"],
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, "Current value cannot be negative"],
    },
    unit: {
      type: String,
      trim: true,
      maxlength: [30, "Unit cannot exceed 30 characters"],
      default: "sessions",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      index: true,
    },
    // NOTE: 'deadline' was previously stored as a separate field (alias for targetDate).
    // It is now a virtual getter (see below) for full backward compatibility without
    // storing redundant data. All new code should use 'targetDate'.
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "COMPLETED", "PAUSED", "EXPIRED"],
        message: "{VALUE} is not a valid goal status",
      },
      default: "ACTIVE",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, category: 1 });
GoalSchema.index({ userId: 1, isCompleted: 1 });
GoalSchema.index({ userId: 1, targetDate: 1 });
GoalSchema.index({ userId: 1, completionPercentage: -1 });

// Virtuals
GoalSchema.virtual("isOverdue").get(function (this: IGoal) {
  const target = this.targetDate || this.deadline;
  if (!target) return false;
  return new Date() > target && this.status !== "COMPLETED" && !this.isCompleted;
});

/** Backward-compatible alias for targetDate — no extra DB storage. */
GoalSchema.virtual("deadline").get(function (this: IGoal) {
  return this.targetDate;
});

GoalSchema.virtual("remainingHours").get(function (this: IGoal) {
  return Math.max(0, Number((this.targetPracticeHours - this.currentPracticeHours).toFixed(1)));
});

GoalSchema.virtual("remainingSessions").get(function (this: IGoal) {
  return Math.max(0, this.targetSessions - this.currentSessions);
});

// Pre-save hook: auto-sync deadline -> targetDate and compute completionPercentage
GoalSchema.pre<IGoal>("save", function (next) {
  // 'deadline' is now a virtual (read-only alias for targetDate).
  // If a caller set targetDate directly, nothing extra to sync.
  // Kept for completeness — targetDate is the canonical field.

  // Calculate completion percentage
  let computedPct = 0;
  if (this.targetPracticeHours > 0 || this.targetSessions > 0 || this.targetPitchAccuracy > 0) {
    const weights: number[] = [];
    if (this.targetPracticeHours > 0) {
      weights.push(Math.min(100, (this.currentPracticeHours / this.targetPracticeHours) * 100));
    }
    if (this.targetSessions > 0) {
      weights.push(Math.min(100, (this.currentSessions / this.targetSessions) * 100));
    }
    if (this.targetPitchAccuracy > 0) {
      weights.push(Math.min(100, (this.currentPitchAccuracy / this.targetPitchAccuracy) * 100));
    }
    computedPct = weights.reduce((acc, curr) => acc + curr, 0) / weights.length;
  } else if (this.targetValue > 0) {
    computedPct = (this.currentValue / this.targetValue) * 100;
  }

  this.completionPercentage = Math.min(100, Math.max(0, Math.round(computedPct)));

  // Auto-complete if at 100%
  if (this.completionPercentage >= 100) {
    this.isCompleted = true;
    this.status = "COMPLETED";
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.isCompleted = false;
    if (this.status === "COMPLETED") {
      this.status = "ACTIVE";
      this.completedAt = undefined;
    }
  }

  next();
});

// Static Aggregation: Analytics
GoalSchema.statics.getUserGoalAnalytics = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  const now = new Date();

  const [result] = await this.aggregate([
    { $match: { userId: userObjectId } },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalGoals: { $sum: 1 },
              activeGoals: {
                $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] },
              },
              completedGoals: {
                $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
              },
              avgCompletionPercentage: { $avg: "$completionPercentage" },
              overdueGoals: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$isCompleted", true] },
                        { $ne: ["$status", "COMPLETED"] },
                        { $ifNull: ["$targetDate", false] },
                        { $lt: ["$targetDate", now] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              completedCount: {
                $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] },
              },
            },
          },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

  const summary = result?.summary?.[0] || {
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    avgCompletionPercentage: 0,
    overdueGoals: 0,
  };

  return {
    totalGoals: summary.totalGoals,
    activeGoals: summary.activeGoals,
    completedGoals: summary.completedGoals,
    avgCompletionPercentage: Number((summary.avgCompletionPercentage || 0).toFixed(1)),
    overdueGoals: summary.overdueGoals,
    categoryBreakdown: result?.categoryBreakdown || [],
  };
};

GoalSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Compound Indexes
GoalSchema.index({ userId: 1, isCompleted: 1, targetDate: 1 });

export const Goal = mongoose.model<IGoal, GoalModel>("Goal", GoalSchema);
