import mongoose, { Schema, Document, Model } from "mongoose";

export type VocalType =
  | "Soprano"
  | "Mezzo-Soprano"
  | "Contralto"
  | "Countertenor"
  | "Tenor"
  | "Baritone"
  | "Bass"
  | "Unclassified";

export type ExperienceLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Professional";

export interface IUserPreferences {
  darkTheme: boolean;
  autoAnalyze: boolean;
  audioInputDevice: string;
  notifications: boolean;
  emailDigest: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  bio: string;
  role?: string;
  vocalType: VocalType;
  experienceLevel: ExperienceLevel;
  preferredGenres: string[];
  totalPracticeHours: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  totalPracticeMinutes: number;
}

export interface UserModel extends Model<IUser> {
  getLeaderboard(limit?: number): Promise<any[]>;
  getUserStatistics(userId: string | mongoose.Types.ObjectId): Promise<any>;
}

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
      index: true,
    },
    password: {
      type: String,
      select: false,
      minlength: [8, "Password must be at least 8 characters"],
    },
    avatar: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "Passionate vocalist dedicated to vocal health, pitch accuracy, and range expansion.",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "coach", "demo"],
      default: "user",
      index: true,
    },
    vocalType: {
      type: String,
      enum: {
        values: [
          "Soprano",
          "Mezzo-Soprano",
          "Contralto",
          "Countertenor",
          "Tenor",
          "Baritone",
          "Bass",
          "Unclassified",
        ],
        message: "{VALUE} is not a supported vocal classification",
      },
      default: "Tenor",
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: {
        values: ["Beginner", "Intermediate", "Advanced", "Professional"],
        message: "{VALUE} is not a valid experience level",
      },
      default: "Intermediate",
      index: true,
    },
    preferredGenres: {
      type: [String],
      default: ["Pop", "R&B"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length <= 15,
        message: "A maximum of 15 preferred genres can be selected",
      },
    },
    totalPracticeHours: {
      type: Number,
      default: 0,
      min: [0, "Total practice hours cannot be negative"],
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, "Streak cannot be negative"],
      index: true,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, "Longest streak cannot be negative"],
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      darkTheme: { type: Boolean, default: true },
      autoAnalyze: { type: Boolean, default: true },
      audioInputDevice: { type: String, default: "Default Microphone" },
      notifications: { type: Boolean, default: true },
      emailDigest: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
UserSchema.index({ currentStreak: -1, totalPracticeHours: -1 });
UserSchema.index({ vocalType: 1, experienceLevel: 1 });

// Virtuals
UserSchema.virtual("totalPracticeMinutes").get(function (this: IUser) {
  return Math.round((this.totalPracticeHours || 0) * 60);
});

// Virtual populates
UserSchema.virtual("recordings", {
  ref: "Recording",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("goals", {
  ref: "Goal",
  localField: "_id",
  foreignField: "userId",
});

UserSchema.virtual("practiceSessions", {
  ref: "PracticeSession",
  localField: "_id",
  foreignField: "userId",
});

// Static Aggregations
UserSchema.statics.getLeaderboard = async function (limit: number = 10) {
  return this.aggregate([
    { $match: { totalPracticeHours: { $gt: 0 } } },
    {
      $project: {
        name: 1,
        avatar: 1,
        vocalType: 1,
        experienceLevel: 1,
        totalPracticeHours: 1,
        currentStreak: 1,
        longestStreak: 1,
      },
    },
    { $sort: { currentStreak: -1, totalPracticeHours: -1 } },
    { $limit: limit },
  ]);
};

UserSchema.statics.getUserStatistics = async function (userId: string | mongoose.Types.ObjectId) {
  const uid =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  const results = await this.aggregate([
    { $match: { _id: uid } },
    {
      $lookup: {
        from: "recordings",
        localField: "_id",
        foreignField: "userId",
        as: "recordings",
      },
    },
    {
      $lookup: {
        from: "practicesessions",
        localField: "_id",
        foreignField: "userId",
        as: "sessions",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        vocalType: 1,
        experienceLevel: 1,
        totalPracticeHours: 1,
        currentStreak: 1,
        longestStreak: 1,
        recordingCount: { $size: "$recordings" },
        sessionCount: { $size: "$sessions" },
      },
    },
  ]);
  return results[0] || null;
};

export const User = mongoose.model<IUser, UserModel>("User", UserSchema);
