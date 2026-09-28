import mongoose, { Schema, Document } from "mongoose";

export interface IPitchPoint {
  time: number;
  frequency: number | null;
  midi: number | null;
  note: string | null;
  is_voiced: boolean;
}

export interface ICoachingFeedback {
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommended_drills: Array<{
    title: string;
    focus: string;
    description: string;
  }>;
}

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  songTitle?: string;
  audioUrl?: string;
  audioFileName: string;
  fileSizeBytes: number;
  durationSeconds: number;
  overallScore: number;
  grade: string;
  pitchAccuracyScore: number;
  pitchStabilityScore: number;
  centsDeviationAvg: number;
  sharpTendencyPct: number;
  flatTendencyPct: number;
  inTunePercentage: number;
  vibratoRateHz: number;
  vibratoDepthCents: number;
  vibratoScore: number;
  dynamicRangeDb: number;
  peakDb: number;
  breathPausesCount: number;
  lowestNote: string;
  highestNote: string;
  rangeSemitones: number;
  voiceTypeDetected: string;
  timbreClarityScore: number;
  spectralCentroidHz: number;
  resonanceProfile: string;
  pitchCurve: IPitchPoint[];
  coachingFeedback: ICoachingFeedback;
  userNotes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PitchPointSchema = new Schema(
  {
    time: { type: Number, required: true },
    frequency: { type: Number, default: null },
    midi: { type: Number, default: null },
    note: { type: String, default: null },
    is_voiced: { type: Boolean, default: false },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    songTitle: { type: String, default: "Vocal Exercise / Freestyle", maxlength: 120 },
    audioUrl: { type: String, default: "" },
    audioFileName: { type: String, default: "recording.wav" },
    fileSizeBytes: { type: Number, default: 0, min: 0 },
    durationSeconds: { type: Number, required: true, min: 0 },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, default: "B+", maxlength: 15 },
    pitchAccuracyScore: { type: Number, required: true, min: 0, max: 100 },
    pitchStabilityScore: { type: Number, required: true, min: 0, max: 100 },
    centsDeviationAvg: { type: Number, default: 0, min: 0 },
    sharpTendencyPct: { type: Number, default: 0, min: 0, max: 100 },
    flatTendencyPct: { type: Number, default: 0, min: 0, max: 100 },
    inTunePercentage: { type: Number, default: 0, min: 0, max: 100 },
    vibratoRateHz: { type: Number, default: 0, min: 0 },
    vibratoDepthCents: { type: Number, default: 0, min: 0 },
    vibratoScore: { type: Number, default: 70, min: 0, max: 100 },
    dynamicRangeDb: { type: Number, default: 0, min: 0 },
    peakDb: { type: Number, default: 0 },
    breathPausesCount: { type: Number, default: 0, min: 0 },
    lowestNote: { type: String, default: "C3", maxlength: 10 },
    highestNote: { type: String, default: "G4", maxlength: 10 },
    rangeSemitones: { type: Number, default: 19, min: 0 },
    voiceTypeDetected: { type: String, default: "Tenor", maxlength: 30 },
    timbreClarityScore: { type: Number, default: 80, min: 0, max: 100 },
    spectralCentroidHz: { type: Number, default: 1500, min: 0 },
    resonanceProfile: { type: String, default: "Balanced", maxlength: 80 },
    pitchCurve: [PitchPointSchema],
    coachingFeedback: {
      summary: { type: String, default: "", maxlength: 1000 },
      strengths: [{ type: String, maxlength: 300 }],
      areas_for_improvement: [{ type: String, maxlength: 300 }],
      recommended_drills: [
        {
          title: { type: String, maxlength: 120 },
          focus: { type: String, maxlength: 80 },
          description: { type: String, maxlength: 500 },
        },
      ],
    },
    userNotes: { type: String, default: "", maxlength: 1000 },
    tags: [{ type: String, maxlength: 30 }],
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, createdAt: -1 });
SessionSchema.index({ userId: 1, overallScore: -1 });

SessionSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Session = mongoose.model<ISession>("Session", SessionSchema);
