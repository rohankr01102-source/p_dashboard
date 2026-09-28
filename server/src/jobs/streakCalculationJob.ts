import { IUserRepository } from "../interfaces/IRepository.interface";
import { Logger } from "../utils/logger";

export class StreakCalculationJob {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(): Promise<void> {
    Logger.info("[Job:StreakCalculation] Running user practice streak calculation audit...");
    try {
      const users = await this.userRepo.findUsersWithActiveStreak();
      const now = new Date();
      const twoDaysAgoMs = now.getTime() - 48 * 60 * 60 * 1000;

      let resetCount = 0;
      for (const user of users) {
        const lastActive = new Date(user.lastActiveDate).getTime();
        // If user hasn't practiced in over 48 hours and streak is > 0, reset streak
        if (lastActive < twoDaysAgoMs && user.currentStreak > 0) {
          await this.userRepo.updateStreak(user.id, 0, user.longestStreak);
          resetCount++;
        }
      }
      Logger.info(`[Job:StreakCalculation] Completed. Reset streak for ${resetCount} inactive vocalists.`);
    } catch (err: any) {
      Logger.error("[Job:StreakCalculation] Error calculating streaks", err);
    }
  }
}
