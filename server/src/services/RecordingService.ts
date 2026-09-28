import path from "path";
import { IRecordingService, IUploadService } from "../interfaces/IService.interface";
import { IRecordingRepository } from "../interfaces/IRepository.interface";
import { IRecordingEntity } from "../interfaces/IRecording.interface";
import { PaginationOptions, PaginatedResult } from "../types/common.types";
import { NotFoundError, ForbiddenError } from "../utils/appError";
import { ENV } from "../config/env";

/**
 * Enterprise Recording Service
 * Orchestrates business logic, ownership authorization, storage telemetry,
 * and audio lifecycle operations between controllers and data repositories.
 */
export class RecordingService implements IRecordingService {
  constructor(
    private readonly recordingRepo: IRecordingRepository,
    private readonly uploadService: IUploadService
  ) {}

  async getAllRecordings(
    userId: string,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<IRecordingEntity> | IRecordingEntity[]> {
    const recordingsWithAnalysis = await this.recordingRepo.findWithAnalysis(userId, pagination.limit);
    if (recordingsWithAnalysis && recordingsWithAnalysis.length > 0) {
      return recordingsWithAnalysis;
    }
    return this.recordingRepo.findByUserId(userId, pagination);
  }

  async getRecordingById(id: string, userId: string): Promise<IRecordingEntity> {
    const recording = await this.recordingRepo.findById(id);
    if (!recording) {
      throw new NotFoundError("Recording not found.");
    }
    if (recording.userId.toString() !== userId.toString()) {
      throw new ForbiddenError("You do not have permission to view this recording.");
    }
    return recording;
  }

  async updateRecording(
    id: string,
    userId: string,
    updateData: Partial<IRecordingEntity>
  ): Promise<IRecordingEntity> {
    const existing = await this.recordingRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Recording not found.");
    }
    if (existing.userId.toString() !== userId.toString()) {
      throw new ForbiddenError("You do not have permission to update this recording.");
    }
    const updated = await this.recordingRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundError("Failed to update recording.");
    }
    return updated;
  }

  async deleteRecording(id: string, userId: string): Promise<boolean> {
    const existing = await this.recordingRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Recording not found.");
    }
    if (existing.userId.toString() !== userId.toString()) {
      throw new ForbiddenError("You do not have permission to delete this recording.");
    }

    await this.recordingRepo.delete(id);

    // Delete corresponding physical audio file on disk
    if (existing.audioUrl) {
      const fileName = path.basename(existing.audioUrl);
      const filePath = path.resolve(ENV.UPLOAD_DIR, fileName);
      await this.uploadService.deleteAudioFile(filePath);
    }
    return true;
  }

  async getStorageStats(userId: string): Promise<any> {
    return this.recordingRepo.getStorageUsage(userId);
  }
}
