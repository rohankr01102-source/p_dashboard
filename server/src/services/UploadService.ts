import fs from "fs";
import path from "path";
import { IUploadService } from "../interfaces/IService.interface";
import { IRecordingRepository } from "../interfaces/IRepository.interface";
import { IRecordingEntity } from "../interfaces/IRecording.interface";
import { AudioUploadMetadata, AudioFormat } from "../types/audio.types";
import { BadRequestError, NotFoundError } from "../utils/appError";
import { Logger } from "../utils/logger";

export class UploadService implements IUploadService {
  constructor(private readonly recordingRepo: IRecordingRepository) {}

  async processUpload(
    file: Express.Multer.File,
    userId: string,
    title?: string,
    tags?: string[]
  ): Promise<IRecordingEntity> {
    if (!file) {
      throw new BadRequestError("Audio file is required for upload.");
    }

    const ext = path.extname(file.originalname).toLowerCase().replace(".", "") as AudioFormat;
    const format = (["wav", "mp3", "m4a", "ogg", "webm", "flac", "aac"].includes(ext) ? ext : "wav") as string;
    
    // Estimate audio duration based on file size and standard 128kbps audio bitrate if not tagged
    const estimatedDurationSeconds = Math.max(
      5,
      Math.min(300, Math.round(file.size / (16000 * 2))) // Typical 16kHz mono estimate
    );

    const recordingTitle = title && title.trim().length > 0 ? title.trim() : "Vocal Take " + new Date().toLocaleDateString();

    const audioUrl = `/uploads/${file.filename}`;

    const recording = await this.recordingRepo.create({
      userId,
      title: recordingTitle,
      audioUrl,
      duration: estimatedDurationSeconds,
      fileSize: file.size,
      format,
      sampleRate: 22050,
      channels: 1,
      tags: tags && tags.length > 0 ? tags : ["Practice"],
      isArchived: false,
    });

    Logger.info(`Audio take uploaded successfully: ${file.filename} by user ${userId} (${recording.id})`);

    return recording;
  }

  async deleteAudioFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        Logger.info(`Audio file deleted from disk: ${filePath}`);
        return true;
      }
      return false;
    } catch (err: any) {
      Logger.error(`Failed to delete audio file: ${filePath}`, err);
      return false;
    }
  }

  async getAudioMetadata(filePath: string): Promise<Partial<AudioUploadMetadata>> {
    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("Audio file not found on disk.");
    }

    const stats = await fs.promises.stat(filePath);
    const ext = path.extname(filePath).toLowerCase().replace(".", "") as AudioFormat;

    return {
      filePath,
      fileSize: stats.size,
      format: ext,
      duration: Math.max(5, Math.round(stats.size / 32000)),
    };
  }
}
