import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlaylistItem {
  recordingId: mongoose.Types.ObjectId;
  addedAt: Date;
  order: number;
  notes?: string;
}

export interface IPlaylist extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  coverImage: string;
  items: IPlaylistItem[];
  isPublic: boolean;
  tags: string[];
  playCount: number;
  favoriteCount: number;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  totalTracks: number;
}

export interface PlaylistModel extends Model<IPlaylist> {
  getPopularPlaylists(
    limit?: number
  ): Promise<
    Array<{
      _id: mongoose.Types.ObjectId;
      title: string;
      description: string;
      coverImage: string;
      playCount: number;
      trackCount: number;
      totalDurationSeconds: number;
      creator: { name: string; avatar: string; vocalType: string };
    }>
  >;
  getUserPlaylistsWithStats(
    userId: string | mongoose.Types.ObjectId
  ): Promise<
    Array<{
      _id: mongoose.Types.ObjectId;
      title: string;
      description: string;
      trackCount: number;
      totalDurationSeconds: number;
      createdAt: Date;
    }>
  >;
}

const PlaylistItemSchema = new Schema<IPlaylistItem>(
  {
    recordingId: {
      type: Schema.Types.ObjectId,
      ref: "Recording",
      required: [true, "Recording reference is required"],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    order: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Item note cannot exceed 300 characters"],
    },
  },
  { _id: false }
);

const PlaylistSchema = new Schema<IPlaylist, PlaylistModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Playlist must belong to a user"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Playlist title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 character"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [PlaylistItemSchema],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags: string[]) => tags.length <= 10,
        message: "Playlists can have at most 10 tags",
      },
    },
    playCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
PlaylistSchema.index({ userId: 1, createdAt: -1 });
PlaylistSchema.index({ isPublic: 1, playCount: -1 });
PlaylistSchema.index({ "items.recordingId": 1 });
PlaylistSchema.index({ title: "text", description: "text", tags: "text" });

// Virtuals
PlaylistSchema.virtual("totalTracks").get(function (this: IPlaylist) {
  return this.items?.length || 0;
});

PlaylistSchema.virtual("creator", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Static Aggregation: Popular Playlists
PlaylistSchema.statics.getPopularPlaylists = async function (limit: number = 10) {
  return await this.aggregate([
    { $match: { isPublic: true } },
    { $sort: { playCount: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "creatorData",
      },
    },
    { $unwind: "$creatorData" },
    {
      $lookup: {
        from: "recordings",
        localField: "items.recordingId",
        foreignField: "_id",
        as: "recordingDocs",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        coverImage: 1,
        playCount: 1,
        favoriteCount: 1,
        trackCount: { $size: "$items" },
        totalDurationSeconds: { $sum: "$recordingDocs.duration" },
        creator: {
          name: "$creatorData.name",
          avatar: "$creatorData.avatar",
          vocalType: "$creatorData.vocalType",
        },
      },
    },
  ]);
};

// Static Aggregation: User Playlists With Stats
PlaylistSchema.statics.getUserPlaylistsWithStats = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const userObjectId =
    typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

  return await this.aggregate([
    { $match: { userId: userObjectId } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "recordings",
        localField: "items.recordingId",
        foreignField: "_id",
        as: "recordingDocs",
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        coverImage: 1,
        isPublic: 1,
        playCount: 1,
        trackCount: { $size: "$items" },
        totalDurationSeconds: { $sum: "$recordingDocs.duration" },
        createdAt: 1,
      },
    },
  ]);
};

PlaylistSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

export const Playlist = mongoose.model<IPlaylist, PlaylistModel>(
  "Playlist",
  PlaylistSchema
);
