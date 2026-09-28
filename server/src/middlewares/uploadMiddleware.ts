import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ENV } from "../config/env";
import { BadRequestError } from "../utils/appError";
import { Logger } from "../utils/logger";

// Ensure upload directory exists on initialization
if (!fs.existsSync(ENV.UPLOAD_DIR)) {
  fs.mkdirSync(ENV.UPLOAD_DIR, { recursive: true });
}

// Whitelisted audio extensions
const ALLOWED_EXTENSIONS = new Set([
  ".wav",
  ".mp3",
  ".m4a",
  ".ogg",
  ".webm",
  ".flac",
  ".aac",
]);

// Whitelisted audio MIME types
const ALLOWED_MIME_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp3",
  "audio/mpeg",
  "audio/m4a",
  "audio/mp4",
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
  "audio/aac",
  "video/webm",
  "application/octet-stream",
]);

/**
 * Disk storage engine with collision-free cryptographic file naming
 */
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ENV.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".wav";
    const uniqueHash = crypto.randomBytes(16).toString("hex");
    cb(null, `take_${Date.now()}_${uniqueHash}${safeExt}`);
  },
});

/**
 * Audio MIME type and extension validation filter
 */
const audioFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  const isAllowedExt = ALLOWED_EXTENSIONS.has(ext) || ext === "";
  const isAllowedMime = ALLOWED_MIME_TYPES.has(mime) || mime.startsWith("audio/");

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        "Unsupported audio format. Allowed formats: WAV, MP3, M4A, OGG, WEBM, FLAC, and AAC.",
        { providedMime: mime, providedExt: ext }
      )
    );
  }
};

/**
 * Multer disk instance for audio uploads (50MB ceiling)
 */
export const audioUpload = multer({
  storage: diskStorage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_BYTES, // 50MB
    files: 1,
  },
});

/**
 * In-memory Multer instance for ephemeral processing
 */
export const memoryAudioUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: audioFileFilter,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

/**
 * Creates an audio upload middleware for a given field name with orphaned file cleanup
 */
export const createAudioUploadMiddleware = (fieldName: string = "audio"): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If client disconnects or aborts before transfer finishes, clean up partial file
    req.on("aborted", async () => {
      if (req.file?.path) {
        try {
          if (fs.existsSync(req.file.path)) {
            await fs.promises.unlink(req.file.path);
            Logger.info(`[Upload] Cleaned up partial aborted upload: ${req.file.path}`);
          }
        } catch (cleanupErr) {
          Logger.error("[Upload] Failed to clean up aborted file", cleanupErr);
        }
      }
    });

    const handler = audioUpload.single(fieldName);
    handler(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return next(new BadRequestError("File exceeds maximum allowed upload size (50MB).", {
              maxSizeBytes: ENV.MAX_FILE_SIZE_BYTES,
            }));
          }
          return next(new BadRequestError(`File upload error: ${err.message}`, { multerCode: err.code }));
        }
        return next(err);
      }
      next();
    });
  };
};

/**
 * Default single audio upload middleware targeting 'audio' field
 */
export const singleAudioUploadMiddleware = createAudioUploadMiddleware("audio");

export default singleAudioUploadMiddleware;
