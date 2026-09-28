import mongoose, { Schema, Document, Model } from "mongoose";

export type AchievementCategory =
  | "INTONATION"
  | "RANGE"
  | "DEDICATION"
  | "VIBRATO"
  | "MILESTONE"
  | "COMMUNITY";

export type AchievementTier = "Bronze" | "Silver" | "Gold" | "Diamond";

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  badgeKey: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  points: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  percentage: number;
  isRecent: boolean;
}

export interface AchievementModel extends Model<IAchievement> {
  getUserGamificationSummary(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{
    totalAchievements: number;
    unlockedCount: number;
    completionRate: number;
    totalPointsEarned: number;
    tierBreakdown: Array<{ _id: string; count: number }>;
    categoryBreakdown: Array<{ _id: string; unlocked: number; total: number }>;
  }>;
  getGlobalLeaderboard(
    limit?: number
  ): Promise<Array<{ _id: mongoose.Types.ObjectId; totalPoints: number; unlockedBadges: number }>>;
}

const AchievementSchema = new Schema<IAchievement, AchievementModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Achievement must belong to a user"],
      index: true,
    },
    badgeKey: {
      type: String,
      required: [true, "Badge key is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Achievement title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Achievement description is required"],
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    icon: {
      type: String,
      default: "Trophy",
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ["INTONATION", "RANGE", "DEDICATION", "VIBRATO", "MILESTONE", "COMMUNITY"],
        message: "{VALUE} is not a valid achievement category",
      },
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: {
        values: ["Bronze", "Silver", "Gold", "Diamond"],
        message: "{VALUE} is not a valid achievement tier",
      },
      default: "Bronze",
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
    },
    maxProgress: {
      type: Number,
      default: 100,
      min: [1, "Max progress must be at least 1"],
    },
    isUnlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    unlockedAt: {
      type: Date,
    },
    points: {
      type: Number,
      default: 50,
      min: [0, "Points cannot be negative"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
AchievementSchema.index({ userId: 1, badgeKey: 1 }, { unique: true });
AchievementSchema.index({ userId: 1, isUnlocked: 1 });
AchievementSchema.index({ userId: 1, unlockedAt: -1 });

// Virtuals
AchievementSchema.virtual("percentage").get(function (this: IAchievement) {
  if (!this.maxProgress || this.maxProgress <= 0) return 0;
  return Math.min(100, Math.round((this.progress / this.maxProgress) * 100));
});

AchievementSchema.virtual("isRecent").get(function (this: IAchievement) {
  if (!this.unlockedAt) return false;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(this.unlockedAt).getTime() < sevenDaysMs;
});

// Pre-save hook: auto unlock if progress >= maxProgress
AchievementSchema.pre<IAchievement>("save", function (next) {
  if (this.progress >= this.maxProgress && !this.isUnlocked) {
    this.isUnlocked = true;
    if (!this.unlockedAt) {
      this.unlockedAt = new Date();
    }
  }
  next();
});

// Static Aggregations
AchievementSchema.statics.getUserGamificationSummary = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const [summary] = await this.aggregate([
    { $match: { userId: userObjectId } },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalAchievements: { $sum: 1 },
              unlockedCount: {
                $sum: { $cond: [{ $eq: ["$isUnlocked", true] }, 1, 0] },
              },
              totalPointsEarned: {
                $sum: {
                  $cond: [{ $eq: ["$isUnlocked", true] }, "$points", 0],
                },
              },
            },
          },
        ],
        tierBreakdown: [
          { $match: { isUnlocked: true } },
          {
            $group: {
              _id: "$tier",
              count: { $sum: 1 },
            },
          },
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: "$category",
              total: { $sum: 1 },
              unlocked: {
                $sum: { $cond: [{ $eq: ["$isUnlocked", true] }, 1, 0] },
              },
            },
          },
        ],
      },
    },
  ]);

  const overview = summary?.overview?.[0] || {
    totalAchievements: 0,
    unlockedCount: 0,
    totalPointsEarned: 0,
  };

  const completionRate =
    overview.totalAchievements > 0
      ? Math.round((overview.unlockedCount / overview.totalAchievements) * 100)
      : 0;

  return {
    totalAchievements: overview.totalAchievements,
    unlockedCount: overview.unlockedCount,
    completionRate,
    totalPointsEarned: overview.totalPointsEarned,
    tierBreakdown: summary?.tierBreakdown || [],
    categoryBreakdown: summary?.categoryBreakdown || [],
  };
};

AchievementSchema.statics.getGlobalLeaderboard = async function (limit: number = 10) {
  return await this.aggregate([
    { $match: { isUnlocked: true } },
    {
      $group: {
        _id: "$userId",
        totalPoints: { $sum: "$points" },
        unlockedBadges: { $sum: 1 },
      },
    },
    { $sort: { totalPoints: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        totalPoints: 1,
        unlockedBadges: 1,
        "user.name": 1,
        "user.avatar": 1,
        "user.vocalType": 1,
        "user.currentStreak": 1,
      },
    },
  ]);
};

AchievementSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Achievement = mongoose.model<IAchievement, AchievementModel>(
  "Achievement",
  AchievementSchema
);
