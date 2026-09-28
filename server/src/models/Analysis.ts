import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVocalRange {
  lowestNote: string;
  highestNote: string;
  lowestMidi?: number;
  highestMidi?: number;
  rangeSemitones: number;
  rangeOctaves: number;
  classifiedVoiceType: string;
}

export interface IVibratoMetrics {
  detected: boolean;
  rateHz: number;
  depthCents: number;
  regularityPct: number;
}

export interface IDrill {
  title: string;
  focus: string;
  instructions: string;
  durationMinutes?: number;
}

export interface IAiFeedback {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendedDrills: IDrill[];
}

export interface IPitchPoint {
  time: number;
  frequency: number | null;
  midi: number | null;
  note: string | null;
  isVoiced: boolean;
}

export interface IAnalysis extends Document {
  recordingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pitchAccuracy: number;
  tempoConsistency: number;
  vocalRange: IVocalRange;
  loudnessScore: number;
  breathingScore: number;
  confidenceScore: number;
  overallPerformanceScore: number;
  vibrato: IVibratoMetrics;
  pitchDeviationCentsAvg: number;
  spectralCentroidHz: number;
  resonanceProfile: string;
  pitchCurve: IPitchPoint[];
  aiFeedback: IAiFeedback;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  performanceGrade: string;
}

export interface AnalysisModel extends Model<IAnalysis> {
  getUserPerformanceSummary(userId: string | mongoose.Types.ObjectId): Promise<any>;
  getProgressTimeline(userId: string | mongoose.Types.ObjectId, days?: number): Promise<any[]>;
}

const VocalRangeSchema = new Schema(
  {
    lowestNote: { type: String, required: true, default: "C3" },
    highestNote: { type: String, required: true, default: "A4" },
    lowestMidi: { type: Number, default: 48 },
    highestMidi: { type: Number, default: 69 },
    rangeSemitones: { type: Number, required: true, min: 0, default: 21 },
    rangeOctaves: { type: Number, required: true, min: 0, default: 1.8 },
    classifiedVoiceType: { type: String, default: "Tenor" },
  },
  { _id: false }
);

const VibratoSchema = new Schema(
  {
    detected: { type: Boolean, default: false },
    rateHz: { type: Number, default: 0, min: 0 },
    depthCents: { type: Number, default: 0, min: 0 },
    regularityPct: { type: Number, default: 50, min: 0, max: 100 },
  },
  { _id: false }
);

const DrillSchema = new Schema(
  {
    title: { type: String, required: true },
    focus: { type: String, required: true },
    instructions: { type: String, required: true },
    durationMinutes: { type: Number, default: 5 },
  },
  { _id: false }
);

const AiFeedbackSchema = new Schema(
  {
    summary: { type: String, required: true, maxlength: 2000 },
    strengths: [{ type: String, maxlength: 400 }],
    areasForImprovement: [{ type: String, maxlength: 400 }],
    recommendedDrills: [DrillSchema],
  },
  { _id: false }
);

const PitchPointSchema = new Schema(
  {
    time: { type: Number, required: true },
    frequency: { type: Number, default: null },
    midi: { type: Number, default: null },
    note: { type: String, default: null },
    isVoiced: { type: Boolean, default: false },
  },
  { _id: false }
);

const AnalysisSchema = new Schema<IAnalysis, AnalysisModel>(
  {
    recordingId: {
      type: Schema.Types.ObjectId,
      ref: "Recording",
      required: [true, "Recording reference is required"],
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    pitchAccuracy: {
      type: Number,
      required: [true, "Pitch accuracy score is required"],
      min: [0, "Pitch accuracy cannot be negative"],
      max: [100, "Pitch accuracy cannot exceed 100"],
      index: true,
    },
    tempoConsistency: {
      type: Number,
      required: [true, "Tempo consistency score is required"],
      min: [0, "Tempo consistency cannot be negative"],
      max: [100, "Tempo consistency cannot exceed 100"],
    },
    vocalRange: {
      type: VocalRangeSchema,
      required: true,
    },
    loudnessScore: {
      type: Number,
      required: [true, "Loudness score is required"],
      min: [0, "Loudness score cannot be negative"],
      max: [100, "Loudness score cannot exceed 100"],
    },
    breathingScore: {
      type: Number,
      required: [true, "Breathing score is required"],
      min: [0, "Breathing score cannot be negative"],
      max: [100, "Breathing score cannot exceed 100"],
    },
    confidenceScore: {
      type: Number,
      required: [true, "Confidence score is required"],
      min: [0, "Confidence score cannot be negative"],
      max: [100, "Confidence score cannot exceed 100"],
    },
    overallPerformanceScore: {
      type: Number,
      required: [true, "Overall performance score is required"],
      min: [0, "Performance score cannot be negative"],
      max: [100, "Performance score cannot exceed 100"],
      index: true,
    },
    vibrato: {
      type: VibratoSchema,
      default: () => ({}),
    },
    pitchDeviationCentsAvg: {
      type: Number,
      default: 12.0,
      min: 0,
    },
    spectralCentroidHz: {
      type: Number,
      default: 1850,
      min: 0,
    },
    resonanceProfile: {
      type: String,
      default: "Optimal Forward Placement",
    },
    pitchCurve: [PitchPointSchema],
    aiFeedback: {
      type: AiFeedbackSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Compound Indexes
AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ userId: 1, overallPerformanceScore: -1 });

// Virtuals
AnalysisSchema.virtual("performanceGrade").get(function (this: IAnalysis) {
  const score = this.overallPerformanceScore || 0;
  if (score >= 94) return "A+";
  if (score >= 88) return "A";
  if (score >= 82) return "B+";
  if (score >= 75) return "B";
  if (score >= 68) return "C+";
  if (score >= 60) return "C";
  return "Needs Work";
});

// Static Aggregation Support
AnalysisSchema.statics.getUserPerformanceSummary = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const uid =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  const result = await this.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: "$userId",
        totalAnalyses: { $sum: 1 },
        avgOverallScore: { $avg: "$overallPerformanceScore" },
        avgPitchAccuracy: { $avg: "$pitchAccuracy" },
        avgTempoConsistency: { $avg: "$tempoConsistency" },
        avgBreathingScore: { $avg: "$breathingScore" },
        avgLoudnessScore: { $avg: "$loudnessScore" },
        avgConfidenceScore: { $avg: "$confidenceScore" },
        maxOverallScore: { $max: "$overallPerformanceScore" },
      },
    },
    {
      $project: {
        _id: 0,
        totalAnalyses: 1,
        avgOverallScore: { $round: ["$avgOverallScore", 1] },
        avgPitchAccuracy: { $round: ["$avgPitchAccuracy", 1] },
        avgTempoConsistency: { $round: ["$avgTempoConsistency", 1] },
        avgBreathingScore: { $round: ["$avgBreathingScore", 1] },
        avgLoudnessScore: { $round: ["$avgLoudnessScore", 1] },
        avgConfidenceScore: { $round: ["$avgConfidenceScore", 1] },
        maxOverallScore: 1,
      },
    },
  ]);
  return result[0] || null;
};

AnalysisSchema.statics.getProgressTimeline = async function (
  userId: string | mongoose.Types.ObjectId,
  days: number = 30
) {
  const uid =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  const sinceDate = new Date(Date.now() - days * 86400000);

  return this.aggregate([
    { $match: { userId: uid, createdAt: { $gte: sinceDate } } },
    { $sort: { createdAt: 1 } },
    {
      $project: {
        date: "$createdAt",
        pitchAccuracy: 1,
        tempoConsistency: 1,
        breathingScore: 1,
        loudnessScore: 1,
        overallPerformanceScore: 1,
        rangeSemitones: "$vocalRange.rangeSemitones",
      },
    },
  ]);
};

export const Analysis = mongoose.model<IAnalysis, AnalysisModel>("Analysis", AnalysisSchema);
