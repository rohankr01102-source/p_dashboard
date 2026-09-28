import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecording extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  audioUrl: string;
  duration: number; // in seconds
  uploadDate: Date;
  fileSize: number; // in bytes
  format: string;
  sampleRate: number;
  channels: number;
  bitrate?: number;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  durationFormatted: string;
  fileSizeMB: number;
}

export interface RecordingModel extends Model<IRecording> {
  getUserStorageUsage(userId: string | mongoose.Types.ObjectId): Promise<{ totalBytes: number; totalMB: number; fileCount: number }>;
  getRecordingsWithAnalysis(userId: string | mongoose.Types.ObjectId, limit?: number): Promise<any[]>;
}

const RecordingSchema = new Schema<IRecording, RecordingModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recording must be associated with a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Recording title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Recording duration is required"],
      min: [0, "Duration must be positive"],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size in bytes is required"],
      min: [0, "File size must be positive"],
    },
    format: {
      type: String,
      default: "wav",
      lowercase: true,
      trim: true,
      enum: ["wav", "mp3", "m4a", "ogg", "webm", "flac", "aac"],
    },
    sampleRate: {
      type: Number,
      default: 22050,
      min: [8000, "Sample rate too low"],
    },
    channels: {
      type: Number,
      default: 1,
      min: 1,
      max: 2,
    },
    bitrate: {
      type: Number,
    },
    tags: {
      type: [String],
      default: ["Practice"],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length <= 10,
        message: "A maximum of 10 tags can be assigned to a recording",
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
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

// Indexes
RecordingSchema.index({ userId: 1, uploadDate: -1 });
RecordingSchema.index({ userId: 1, isArchived: 1, createdAt: -1 });
RecordingSchema.index({ audioUrl: 1 });
RecordingSchema.index({ title: "text", tags: "text" });

// Virtuals
RecordingSchema.virtual("durationFormatted").get(function (this: IRecording) {
  const totalSecs = Math.round(this.duration || 0);
  const minutes = Math.floor(totalSecs / 60);
  const seconds = totalSecs % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
});

RecordingSchema.virtual("fileSizeMB").get(function (this: IRecording) {
  return Math.round(((this.fileSize || 0) / (1024 * 1024)) * 100) / 100;
});

// Virtual populate for 1-to-1 Analysis
RecordingSchema.virtual("analysis", {
  ref: "Analysis",
  localField: "_id",
  foreignField: "recordingId",
  justOne: true,
});

// Static Aggregation Methods
RecordingSchema.statics.getUserStorageUsage = async function (userId: string | mongoose.Types.ObjectId) {
  const uid =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  const result = await this.aggregate([
    { $match: { userId: uid, isArchived: false } },
    {
      $group: {
        _id: "$userId",
        totalBytes: { $sum: "$fileSize" },
        fileCount: { $sum: 1 },
        totalDurationSeconds: { $sum: "$duration" },
      },
    },
    {
      $project: {
        _id: 0,
        totalBytes: 1,
        totalMB: { $round: [{ $divide: ["$totalBytes", 1048576] }, 2] },
        fileCount: 1,
        totalDurationSeconds: 1,
      },
    },
  ]);
  return result[0] || { totalBytes: 0, totalMB: 0, fileCount: 0, totalDurationSeconds: 0 };
};

RecordingSchema.statics.getRecordingsWithAnalysis = async function (
  userId: string | mongoose.Types.ObjectId,
  limit: number = 20
) {
  const uid =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;
  return this.aggregate([
    { $match: { userId: uid, isArchived: false } },
    { $sort: { uploadDate: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "analyses",
        localField: "_id",
        foreignField: "recordingId",
        as: "analysisData",
      },
    },
    {
      $unwind: {
        path: "$analysisData",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);
};

export const Recording = mongoose.model<IRecording, RecordingModel>("Recording", RecordingSchema);
