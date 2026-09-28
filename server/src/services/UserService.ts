import { IUserService } from "../interfaces/IService.interface";
import { IUserRepository } from "../interfaces/IRepository.interface";
import { IUserEntity, IUserPreferences } from "../interfaces/IUser.interface";
import { NotFoundError } from "../utils/appError";
import { Logger } from "../utils/logger";

export class UserService implements IUserService {
  constructor(private readonly userRepo: IUserRepository) {}

  async getProfile(userId: string): Promise<IUserEntity | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User profile not found.");
    }
    return user;
  }

  async updateProfile(userId: string, data: Partial<IUserEntity>): Promise<IUserEntity | null> {
    const existing = await this.getProfile(userId);
    if (!existing) {
      throw new NotFoundError("User profile not found.");
    }

    const updated = await this.userRepo.update(userId, data);
    Logger.info(`Profile updated for user ${userId}`);
    return updated;
  }

  async updatePreferences(userId: string, preferences: Partial<IUserPreferences>): Promise<IUserEntity | null> {
    const user = await this.getProfile(userId);
    if (!user) {
      throw new NotFoundError("User profile not found.");
    }

    const mergedPreferences = {
      ...user.preferences,
      ...preferences,
    };

    return this.userRepo.update(userId, { preferences: mergedPreferences });
  }

  async getUserStats(userId: string): Promise<Record<string, any>> {
    return this.userRepo.getUserStatistics(userId);
  }

  async getLeaderboard(limit: number = 10): Promise<IUserEntity[]> {
    return this.userRepo.getLeaderboard(limit);
  }
}
