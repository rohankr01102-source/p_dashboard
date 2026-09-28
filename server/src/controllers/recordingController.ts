import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { IUploadService, IAnalysisService, IRecordingService } from "../interfaces/IService.interface";
import { IRecordingRepository } from "../interfaces/IRepository.interface";
import { RecordingService } from "../services/RecordingService";
import { RecordingValidators } from "../validators/recordingValidators";
import { CommonValidators } from "../validators/commonValidators";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from "../utils/appError";
import { ENV } from "../config/env";
import { Logger } from "../utils/logger";

export class RecordingController {
  private readonly recordingService: IRecordingService;

  constructor(
    private readonly uploadService: IUploadService,
    private readonly recordingRepo: IRecordingRepository,
    private readonly analysisService: IAnalysisService,
    recordingService?: IRecordingService
  ) {
    this.recordingService = recordingService || new RecordingService(this.recordingRepo, this.uploadService);
  }

  uploadRecording = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw new BadRequestError("Audio file is required for upload.");
    }

    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required to upload recordings.");
    }

    const { title, tags } = RecordingValidators.validateUploadMetadata(req.body);

    // 1. Process and record audio take metadata
    const recording = await this.uploadService.processUpload(file, userId, title, tags);

    // 2. Perform automated vocal analysis
    let analysis = null;
    try {
      analysis = await this.analysisService.analyzeRecording(recording.id, userId);
    } catch (err: any) {
      Logger.warn(`Initial automated analysis skipped or failed: ${err.message}`);
    }

    const responseData = {
      ...recording,
      analysis,
    };

    return ApiResponse.created(res, responseData, "Audio take uploaded and analyzed successfully.");
  });

  getAllRecordings = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required to view recordings.");
    }

    const pagination = CommonValidators.validatePagination(req.query);
    const result = await this.recordingService.getAllRecordings(userId, pagination);

    if (Array.isArray(result)) {
      return ApiResponse.success(res, result, "Recordings retrieved successfully.");
    }
    return ApiResponse.paginated(res, result, "Recordings retrieved successfully.");
  });

  getRecordingById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    RecordingValidators.validateId(id);

    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    const recording = await this.recordingService.getRecordingById(id, userId || "");
    const analysis = await this.analysisService.getAnalysisByRecording(id, recording.userId);

    return ApiResponse.success(res, { ...recording, analysis }, "Recording retrieved successfully.");
  });

  updateRecording = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    RecordingValidators.validateId(id);

    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }

    const updated = await this.recordingService.updateRecording(id, userId, req.body);
    return ApiResponse.success(res, updated, "Recording updated successfully.");
  });

  deleteRecording = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    RecordingValidators.validateId(id);

    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }

    await this.recordingService.deleteRecording(id, userId);
    return ApiResponse.success(res, { id, deleted: true }, "Recording deleted successfully.");
  });

  getStorageStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?._id?.toString() || (req as any).user?.id?.toString();
    if (!userId) {
      throw new UnauthorizedError("Authentication required.");
    }

    const stats = await this.recordingService.getStorageStats(userId);
    return ApiResponse.success(res, stats, "Storage metrics retrieved.");
  });

  streamAudio = asyncHandler(async (req: Request, res: Response) => {
    const filename = req.params.filename as string;
    const safeFilename = path.basename(filename);
    const resolvedUploadDir = path.resolve(ENV.UPLOAD_DIR);
    const filePath = path.resolve(resolvedUploadDir, safeFilename);

    // Canonical path traversal guard
    const relative = path.relative(resolvedUploadDir, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new ForbiddenError("Access to the requested file is forbidden.");
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundError("Audio track not found.");
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(safeFilename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".wav": "audio/wav",
      ".mp3": "audio/mpeg",
      ".m4a": "audio/mp4",
      ".ogg": "audio/ogg",
      ".webm": "audio/webm",
      ".flac": "audio/flac",
      ".aac": "audio/aac",
    };
    const contentType = mimeMap[ext] || "audio/wav";

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // RFC 7233 range bounds validation
      if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
        res.status(416).setHeader("Content-Range", `bytes */${fileSize}`);
        return ApiResponse.error(res, "Requested range not satisfiable", 416, "RANGE_NOT_SATISFIABLE");
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
      };

      file.on("error", (err) => {
        Logger.error(`[streamAudio] Stream error on ${safeFilename}:`, err);
        if (!res.headersSent) res.status(500).end();
      });
      req.on("close", () => file.destroy());

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": contentType,
      };

      const file = fs.createReadStream(filePath);
      file.on("error", (err) => {
        Logger.error(`[streamAudio] Stream error on ${safeFilename}:`, err);
        if (!res.headersSent) res.status(500).end();
      });
      req.on("close", () => file.destroy());

      res.writeHead(200, head);
      file.pipe(res);
    }
  });
}
