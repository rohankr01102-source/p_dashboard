import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  reportPeriod: "WEEKLY" | "MONTHLY" | "COMPREHENSIVE";
  startDate: Date;
  endDate: Date;
  summary: {
    totalSessions: number;
    totalMinutesPracticed: number;
    averageScore: number;
    pitchAccuracyAvg: number;
    stabilityAvg: number;
    vibratoConsistencyAvg: number;
    rangeCovered: string;
    trendPitch: "UP" | "DOWN" | "STEADY";
    trendDynamics: "UP" | "DOWN" | "STEADY";
  };
  keyStrengths: string[];
  growthAreas: string[];
  prescribedWarmups: Array<{
    title: string;
    focus: string;
    instructions: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    reportPeriod: {
      type: String,
      enum: ["WEEKLY", "MONTHLY", "COMPREHENSIVE"],
      default: "WEEKLY",
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    summary: {
      totalSessions: { type: Number, default: 0 },
      totalMinutesPracticed: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      pitchAccuracyAvg: { type: Number, default: 0 },
      stabilityAvg: { type: Number, default: 0 },
      vibratoConsistencyAvg: { type: Number, default: 0 },
      rangeCovered: { type: String, default: "C3 - A4" },
      trendPitch: { type: String, enum: ["UP", "DOWN", "STEADY"], default: "UP" },
      trendDynamics: { type: String, enum: ["UP", "DOWN", "STEADY"], default: "UP" },
    },
    keyStrengths: [{ type: String }],
    growthAreas: [{ type: String }],
    prescribedWarmups: [
      {
        title: String,
        focus: String,
        instructions: String,
      },
    ],
  },
  { timestamps: true }
);

ReportSchema.index({ userId: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>("Report", ReportSchema);
