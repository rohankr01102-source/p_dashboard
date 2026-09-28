import { StreakCalculationJob } from "./streakCalculationJob";
import { AudioCleanupJob } from "./audioCleanupJob";
import { WeeklyReportJob } from "./weeklyReportJob";
import { container } from "../config/container";
import { Logger } from "../utils/logger";

export * from "./streakCalculationJob";
export * from "./audioCleanupJob";
export * from "./weeklyReportJob";

let jobTimers: NodeJS.Timeout[] = [];

export const initBackgroundJobs = (): void => {
  Logger.info("[JobScheduler] Initializing background maintenance and analytics jobs...");

  const streakJob = new StreakCalculationJob(container.userRepository);
  const audioJob = new AudioCleanupJob(container.recordingRepository);
  const weeklyJob = new WeeklyReportJob(container.userRepository, container.notificationRepository);

  // Run initial lightweight audit on startup
  streakJob.execute().catch((err) => Logger.error("[JobScheduler] Startup streak audit failed", err));

  // Streak audit: Run every 6 hours
  const streakTimer = setInterval(() => {
    streakJob.execute();
  }, 6 * 60 * 60 * 1000);

  // Audio cleanup: Run every 24 hours
  const audioTimer = setInterval(() => {
    audioJob.execute();
  }, 24 * 60 * 60 * 1000);

  // Weekly digest: Run every 7 days
  const weeklyTimer = setInterval(() => {
    weeklyJob.execute();
  }, 7 * 24 * 60 * 60 * 1000);

  jobTimers = [streakTimer, audioTimer, weeklyTimer];
};

export const stopBackgroundJobs = (): void => {
  Logger.info("[JobScheduler] Stopping background jobs...");
  jobTimers.forEach((timer) => clearInterval(timer));
  jobTimers = [];
};
