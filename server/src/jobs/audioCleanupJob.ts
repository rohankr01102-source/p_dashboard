import fs from "fs";
import path from "path";
import { IRecordingRepository } from "../interfaces/IRepository.interface";
import { ENV } from "../config/env";
import { Logger } from "../utils/logger";
import { memoryStore } from "../services/store";

export class AudioCleanupJob {
  constructor(private readonly recordingRepo: IRecordingRepository) {}

  async execute(): Promise<void> {
    Logger.info("[Job:AudioCleanup] Scanning for orphaned audio files in upload directory...");
    try {
      if (!fs.existsSync(ENV.UPLOAD_DIR)) return;

      const files = await fs.promises.readdir(ENV.UPLOAD_DIR);
      let removedCount = 0;
      const now = Date.now();
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days

      for (const file of files) {
        if (file === ".gitkeep" || file === "demo.wav") continue;

        const filePath = path.join(ENV.UPLOAD_DIR, file);
        const stats = await fs.promises.stat(filePath);

        // Delete temporary files older than 7 days if unassociated or transient
        if (now - stats.mtimeMs > maxAgeMs) {
          // Check if file is tracked in DB or memoryStore
          const audioUrl = `/uploads/${file}`;
          const existing = await this.recordingRepo.findOne({ audioUrl });
          const inMemory = memoryStore.sessions.some((s) => s.audioUrl === audioUrl);

          if (!existing && !inMemory) {
            await fs.promises.unlink(filePath);
            removedCount++;
            Logger.info(`[Job:AudioCleanup] Purged orphan file: ${file}`);
          }
        }
      }

      Logger.info(`[Job:AudioCleanup] Completed. Cleaned up ${removedCount} orphaned files.`);
    } catch (err: any) {
      Logger.error("[Job:AudioCleanup] Error performing audio cleanup", err);
    }
  }
}
