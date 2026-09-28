import mongoose from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { IRecordingEntity } from "../interfaces/IRecording.interface";
import { IRecordingRepository } from "../interfaces/IRepository.interface";
import { Recording, IRecording } from "../models/Recording";
import { memoryStore } from "../services/store";
import { PaginationOptions, PaginatedResult } from "../types/common.types";

export class RecordingRepository extends BaseRepository<IRecordingEntity, IRecording> implements IRecordingRepository {
  constructor() {
    super(Recording, memoryStore.sessions);
  }

  protected mapToEntity(doc: any): IRecordingEntity {
    return {
      id: doc._id?.toString() || doc.id?.toString(),
      userId: doc.userId?.toString() || doc.user?.toString(),
      title: doc.title || doc.songTitle || "Vocal Take",
      audioUrl: doc.audioUrl || "",
      duration: doc.duration || 0,
      uploadDate: doc.uploadDate || doc.date || doc.createdAt || new Date(),
      fileSize: doc.fileSize || 1024 * 1024,
      format: doc.format || "wav",
      sampleRate: doc.sampleRate || 22050,
      channels: doc.channels || 1,
      bitrate: doc.bitrate,
      tags: doc.tags || ["Practice"],
      isArchived: doc.isArchived || false,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };
  }

  async findByUserId(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<IRecordingEntity>> {
    return this.find({ userId, isArchived: false }, options);
  }

  async findWithAnalysis(userId: string, limit: number = 20): Promise<any[]> {
    if (this.isDbAvailable()) {
      try {
        const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
        const userFilter = userObjId ? { $in: [userId, userObjId] } : userId;

        const results = await this.model.aggregate([
          { $match: { userId: userFilter, isArchived: { $ne: true } } },
          { $sort: { createdAt: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: "analyses",
              localField: "_id",
              foreignField: "recordingId",
              as: "analysis",
            },
          },
          {
            $unwind: {
              path: "$analysis",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]);
        if (results && results.length > 0) {
          return results;
        }
      } catch (err) {}
    }

    // Fallback: return memory sessions with synthetic or mapped analysis
    return this.memoryCollection
      .filter((s) => (s.userId || s.user)?.toString() === userId.toString())
      .slice(0, limit);
  }

  async getStorageUsage(userId: string): Promise<{ totalBytes: number; totalMB: number; fileCount: number }> {
    if (this.isDbAvailable()) {
      try {
        const res = await (this.model as any).getUserStorageUsage(userId);
        if (res) return res;
      } catch (err) {}
    }

    const userRecordings = this.memoryCollection.filter(
      (r) => (r.userId || r.user)?.toString() === userId.toString()
    );
    const totalBytes = userRecordings.reduce((sum, r) => sum + (r.fileSize || 1024 * 1024), 0);
    return {
      totalBytes,
      totalMB: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
      fileCount: userRecordings.length,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const updated = await this.update(id, { isArchived: true } as any);
    return !!updated;
  }
}
