import mongoose, { Schema, Document, Model } from "mongoose";

export type FeedbackAuthorType =
  | "AI_COACH"
  | "VERIFIED_COACH"
  | "PEER_SINGER"
  | "SELF_REVIEW";

export interface IAspectRatings {
  pitchAccuracy: number;
  breathControl: number;
  toneQuality: number;
  vocalAgility: number;
  emotionalDelivery: number;
}

export interface IFeedback extends Document {
  recordingId: mongoose.Types.ObjectId;
  analysisId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Singer receiving feedback
  authorId?: mongoose.Types.ObjectId; // Reviewer/Coach, optional for AI
  authorType: FeedbackAuthorType;
  overallRating: number; // 1 to 5 stars
  aspectRatings: IAspectRatings;
  writtenFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  actionableTips: string[];
  helpfulVotes: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  averageAspectScore: number;
}

export interface FeedbackModel extends Model<IFeedback> {
  getFeedbackSummaryForSinger(
    userId: string | mongoose.Types.ObjectId
  ): Promise<{
    totalFeedbacks: number;
    avgOverallRating: number;
    avgPitchAccuracy: number;
    avgBreathControl: number;
    avgToneQuality: number;
    avgVocalAgility: number;
    avgEmotionalDelivery: number;
    authorTypeBreakdown: Array<{ _id: string; count: number }>;
  }>;
  getTopTipsForSinger(
    userId: string | mongoose.Types.ObjectId,
    limit?: number
  ): Promise<string[]>;
}

const AspectRatingsSchema = new Schema<IAspectRatings>(
  {
    pitchAccuracy: {
      type: Number,
      required: true,
      min: [1, "Pitch rating must be between 1 and 5"],
      max: [5, "Pitch rating must be between 1 and 5"],
      default: 3,
    },
    breathControl: {
      type: Number,
      required: true,
      min: [1, "Breath control rating must be between 1 and 5"],
      max: [5, "Breath control rating must be between 1 and 5"],
      default: 3,
    },
    toneQuality: {
      type: Number,
      required: true,
      min: [1, "Tone quality rating must be between 1 and 5"],
      max: [5, "Tone quality rating must be between 1 and 5"],
      default: 3,
    },
    vocalAgility: {
      type: Number,
      required: true,
      min: [1, "Vocal agility rating must be between 1 and 5"],
      max: [5, "Vocal agility rating must be between 1 and 5"],
      default: 3,
    },
    emotionalDelivery: {
      type: Number,
      required: true,
      min: [1, "Emotional delivery rating must be between 1 and 5"],
      max: [5, "Emotional delivery rating must be between 1 and 5"],
      default: 3,
    },
  },
  { _id: false }
);

const FeedbackSchema = new Schema<IFeedback, FeedbackModel>(
  {
    recordingId: {
      type: Schema.Types.ObjectId,
      ref: "Recording",
      required: [true, "Feedback must be associated with a recording"],
      index: true,
    },
    analysisId: {
      type: Schema.Types.ObjectId,
      ref: "Analysis",
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient singer is required"],
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    authorType: {
      type: String,
      enum: {
        values: ["AI_COACH", "VERIFIED_COACH", "PEER_SINGER", "SELF_REVIEW"],
        message: "{VALUE} is not a valid feedback author type",
      },
      default: "AI_COACH",
      index: true,
    },
    overallRating: {
      type: Number,
      required: [true, "Overall rating is required"],
      min: [1, "Overall rating must be at least 1 star"],
      max: [5, "Overall rating cannot exceed 5 stars"],
      index: true,
    },
    aspectRatings: {
      type: AspectRatingsSchema,
      required: true,
      default: () => ({
        pitchAccuracy: 3,
        breathControl: 3,
        toneQuality: 3,
        vocalAgility: 3,
        emotionalDelivery: 3,
      }),
    },
    writtenFeedback: {
      type: String,
      required: [true, "Written feedback text is required"],
      trim: true,
      minlength: [10, "Feedback must be at least 10 characters long"],
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    strengths: {
      type: [String],
      default: [],
    },
    areasForImprovement: {
      type: [String],
      default: [],
    },
    actionableTips: {
      type: [String],
      default: [],
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
FeedbackSchema.index({ recordingId: 1, createdAt: -1 });
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ userId: 1, overallRating: -1 });
FeedbackSchema.index({ authorId: 1, createdAt: -1 });

// Virtuals
FeedbackSchema.virtual("averageAspectScore").get(function (this: IFeedback) {
  if (!this.aspectRatings) return 0;
  const scores = [
    this.aspectRatings.pitchAccuracy,
    this.aspectRatings.breathControl,
    this.aspectRatings.toneQuality,
    this.aspectRatings.vocalAgility,
    this.aspectRatings.emotionalDelivery,
  ];
  const sum = scores.reduce((acc, curr) => acc + (curr || 0), 0);
  return Number((sum / scores.length).toFixed(1));
});

// Virtual populates
FeedbackSchema.virtual("recording", {
  ref: "Recording",
  localField: "recordingId",
  foreignField: "_id",
  justOne: true,
});

FeedbackSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

// Static Aggregations
FeedbackSchema.statics.getFeedbackSummaryForSinger = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

  const [summary] = await this.aggregate([
    { $match: { userId: userObjectId } },
    {
      $facet: {
        averages: [
          {
            $group: {
              _id: null,
              totalFeedbacks: { $sum: 1 },
              avgOverallRating: { $avg: "$overallRating" },
              avgPitchAccuracy: { $avg: "$aspectRatings.pitchAccuracy" },
              avgBreathControl: { $avg: "$aspectRatings.breathControl" },
              avgToneQuality: { $avg: "$aspectRatings.toneQuality" },
              avgVocalAgility: { $avg: "$aspectRatings.vocalAgility" },
              avgEmotionalDelivery: { $avg: "$aspectRatings.emotionalDelivery" },
            },
          },
        ],
        authorBreakdown: [
          {
            $group: {
              _id: "$authorType",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

  const row = summary?.averages?.[0] || {
    totalFeedbacks: 0,
    avgOverallRating: 0,
    avgPitchAccuracy: 0,
    avgBreathControl: 0,
    avgToneQuality: 0,
    avgVocalAgility: 0,
    avgEmotionalDelivery: 0,
  };

  return {
    totalFeedbacks: row.totalFeedbacks,
    avgOverallRating: Number((row.avgOverallRating || 0).toFixed(1)),
    avgPitchAccuracy: Number((row.avgPitchAccuracy || 0).toFixed(1)),
    avgBreathControl: Number((row.avgBreathControl || 0).toFixed(1)),
    avgToneQuality: Number((row.avgToneQuality || 0).toFixed(1)),
    avgVocalAgility: Number((row.avgVocalAgility || 0).toFixed(1)),
    avgEmotionalDelivery: Number((row.avgEmotionalDelivery || 0).toFixed(1)),
    authorTypeBreakdown: summary?.authorBreakdown || [],
  };
};

FeedbackSchema.statics.getTopTipsForSinger = async function (
  userId: string | mongoose.Types.ObjectId,
  limit: number = 5
) {
  const userObjectId =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

  const results = await this.aggregate([
    { $match: { userId: userObjectId } },
    { $unwind: "$actionableTips" },
    {
      $group: {
        _id: "$actionableTips",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return results.map((r: { _id: string }) => r._id);
};

FeedbackSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Feedback = mongoose.model<IFeedback, FeedbackModel>(
  "Feedback",
  FeedbackSchema
);
