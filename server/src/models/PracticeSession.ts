import mongoose, { Schema, Document, Model } from "mongoose";

export type SessionType =
  | "WARM_UP"
  | "RANGE_EXTENSION"
  | "INTONATION_DRILL"
  | "SONG_REHEARSAL"
  | "BREATH_CONTROL"
  | "FREESTYLE";

export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export type SingerMood =
  | "ENERGIZED"
  | "RELAXED"
  | "FRUSTRATED"
  | "TIRED"
  | "CONFIDENT"
  | "NEUTRAL";

export interface ISessionDrill {
  name: string;
  category: string;
  durationSeconds: number;
  repsCompleted: number;
  notes?: string;
}

export interface IPracticeSession extends Document {
  userId: mongoose.Types.ObjectId;
  recordingId?: mongoose.Types.ObjectId;
  title: string;
  sessionType: SessionType;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  drillsCompleted: ISessionDrill[];
  perceivedDifficulty: number; // 1 (very easy) to 5 (extremely demanding)
  vocalFatigueLevel: number; // 1 (fresh) to 5 (exhausted)
  mood: SingerMood;
  notes?: string;
  status: SessionStatus;
  tags: string[];
  audioUrl?: string;
  overallScore?: number;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  isActive: boolean;
  durationFormatted: string;
}

export interface PracticeSessionModel extends Model<IPracticeSession> {
  getAggregatedSessionStats(
    userId: string | mongoose.Types.ObjectId,
    days?: number
  ): Promise<{
    totalSessions: number;
    totalPracticeMinutes: number;
    avgDifficulty: number;
    avgFatigue: number;
    avgScore: number;
    sessionTypeBreakdown: Array<{ _id: string; count: number; totalMinutes: number }>;
    dailyActivity: Array<{ date: string; sessionCount: number; minutes: number }>;
  }>;
  getPracticeStreaks(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{ currentStreak: number; longestStreak: number; lastPracticeDate: Date | null }>;
}

const SessionDrillSchema = new Schema<ISessionDrill>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, trim: true, maxlength: 60 },
    durationSeconds: { type: Number, default: 0, min: 0 },
    repsCompleted: { type: Number, default: 1, min: 0 },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false }
);

const PracticeSessionSchema = new Schema<IPracticeSession, PracticeSessionModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Practice session must be associated with a user"],
      index: true,
    },
    recordingId: {
      type: Schema.Types.ObjectId,
      ref: "Recording",
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
      default: "Vocal Practice Session",
    },
    sessionType: {
      type: String,
      enum: {
        values: [
          "WARM_UP",
          "RANGE_EXTENSION",
          "INTONATION_DRILL",
          "SONG_REHEARSAL",
          "BREATH_CONTROL",
          "FREESTYLE",
        ],
        message: "{VALUE} is not a valid session type",
      },
      default: "SONG_REHEARSAL",
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
      required: [true, "Start time is required"],
      index: true,
    },
    endTime: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: [0, "Duration minutes cannot be negative"],
    },
    drillsCompleted: {
      type: [SessionDrillSchema],
      default: [],
    },
    perceivedDifficulty: {
      type: Number,
      min: [1, "Difficulty must be between 1 and 5"],
      max: [5, "Difficulty must be between 1 and 5"],
      default: 3,
    },
    vocalFatigueLevel: {
      type: Number,
      min: [1, "Fatigue level must be between 1 and 5"],
      max: [5, "Fatigue level must be between 1 and 5"],
      default: 1,
    },
    mood: {
      type: String,
      enum: {
        values: ["ENERGIZED", "RELAXED", "FRUSTRATED", "TIRED", "CONFIDENT", "NEUTRAL"],
        message: "{VALUE} is not a valid mood",
      },
      default: "CONFIDENT",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["IN_PROGRESS", "COMPLETED", "ABANDONED"],
        message: "{VALUE} is not a valid session status",
      },
      default: "COMPLETED",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: "A practice session can have at most 10 tags",
      },
    },
    audioUrl: {
      type: String,
      trim: true,
    },
    overallScore: {
      type: Number,
      min: [0, "Overall score cannot be less than 0"],
      max: [100, "Overall score cannot exceed 100"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound Indexes for high performance querying
PracticeSessionSchema.index({ userId: 1, startTime: -1 });
PracticeSessionSchema.index({ userId: 1, status: 1 });
PracticeSessionSchema.index({ userId: 1, sessionType: 1 });
PracticeSessionSchema.index({ userId: 1, overallScore: -1 });

// Virtuals
PracticeSessionSchema.virtual("isActive").get(function (this: IPracticeSession) {
  return !this.endTime && this.status === "IN_PROGRESS";
});

PracticeSessionSchema.virtual("durationFormatted").get(function (this: IPracticeSession) {
  const hours = Math.floor(this.durationMinutes / 60);
  const minutes = Math.round(this.durationMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
});

// Virtual populate to Recording
PracticeSessionSchema.virtual("recording", {
  ref: "Recording",
  localField: "recordingId",
  foreignField: "_id",
  justOne: true,
});

// Pre-save hook: auto-compute duration if endTime is supplied
PracticeSessionSchema.pre<IPracticeSession>("save", function (next) {
  if (this.endTime && this.startTime) {
    const diffMs = this.endTime.getTime() - this.startTime.getTime();
    if (diffMs > 0 && this.durationMinutes === 0) {
      this.durationMinutes = Math.round(diffMs / 60000);
    }
  }
  next();
});

// Static Aggregation: Comprehensive Session Stats
PracticeSessionSchema.statics.getAggregatedSessionStats = async function (
  userId: string | mongoose.Types.ObjectId,
  days: number = 30
) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const [summary] = await this.aggregate([
    {
      $match: {
        userId: userObjectId,
        startTime: { $gte: sinceDate },
        status: "COMPLETED",
      },
    },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalSessions: { $sum: 1 },
              totalPracticeMinutes: { $sum: "$durationMinutes" },
              avgDifficulty: { $avg: "$perceivedDifficulty" },
              avgFatigue: { $avg: "$vocalFatigueLevel" },
              avgScore: { $avg: "$overallScore" },
            },
          },
        ],
        typeBreakdown: [
          {
            $group: {
              _id: "$sessionType",
              count: { $sum: 1 },
              totalMinutes: { $sum: "$durationMinutes" },
            },
          },
          { $sort: { count: -1 } },
        ],
        dailyActivity: [
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
              sessionCount: { $sum: 1 },
              minutes: { $sum: "$durationMinutes" },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              date: "$_id",
              sessionCount: 1,
              minutes: 1,
            },
          },
        ],
      },
    },
  ]);

  const totalRow = summary?.totals?.[0] || {
    totalSessions: 0,
    totalPracticeMinutes: 0,
    avgDifficulty: 0,
    avgFatigue: 0,
    avgScore: 0,
  };

  return {
    totalSessions: totalRow.totalSessions,
    totalPracticeMinutes: Math.round(totalRow.totalPracticeMinutes || 0),
    avgDifficulty: Number((totalRow.avgDifficulty || 0).toFixed(1)),
    avgFatigue: Number((totalRow.avgFatigue || 0).toFixed(1)),
    avgScore: Number((totalRow.avgScore || 0).toFixed(1)),
    sessionTypeBreakdown: summary?.typeBreakdown || [],
    dailyActivity: summary?.dailyActivity || [],
  };
};

// Static Aggregation: Practice Streaks calculation
PracticeSessionSchema.statics.getPracticeStreaks = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  const datesResult = await this.aggregate([
    {
      $match: {
        userId: userObjectId,
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  if (!datesResult || datesResult.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastPracticeDate: null };
  }

  const sortedDates = datesResult.map((d: { _id: string }) => new Date(d._id));
  const lastPracticeDate = sortedDates[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentPractice = new Date(sortedDates[0]);
  mostRecentPractice.setHours(0, 0, 0, 0);

  const diffDaysFromToday = Math.round(
    (today.getTime() - mostRecentPractice.getTime()) / (1000 * 60 * 60 * 24)
  );

  let currentStreak = 0;
  if (diffDaysFromToday <= 1) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = sortedDates.length > 0 ? 1 : 0;
  let tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak, lastPracticeDate };
};

// JSON Sanitization
PracticeSessionSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const PracticeSession = mongoose.model<IPracticeSession, PracticeSessionModel>(
  "PracticeSession",
  PracticeSessionSchema
);
