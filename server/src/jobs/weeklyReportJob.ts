import { IUserRepository, INotificationRepository } from "../interfaces/IRepository.interface";
import { Logger } from "../utils/logger";

export class WeeklyReportJob {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly notifRepo: INotificationRepository
  ) {}

  async execute(): Promise<void> {
    Logger.info("[Job:WeeklyReport] Generating weekly practice summary digests...");
    try {
      const activeUsers = await this.userRepo.getLeaderboard(50);
      let sentCount = 0;

      for (const user of activeUsers) {
        if (user.preferences?.notifications) {
          await this.notifRepo.create({
            userId: user.id,
            title: "Weekly Vocal Summary Ready",
            message: `Great dedication this week! You've logged ${user.totalPracticeHours.toFixed(1)} practice hours with a streak of ${user.currentStreak} days.`,
            type: "SYSTEM_ALERT",
            read: false,
            link: "/reports",
          });
          sentCount++;
        }
      }

      Logger.info(`[Job:WeeklyReport] Completed. Sent digests to ${sentCount} singers.`);
    } catch (err: any) {
      Logger.error("[Job:WeeklyReport] Error generating weekly reports", err);
    }
  }
}
