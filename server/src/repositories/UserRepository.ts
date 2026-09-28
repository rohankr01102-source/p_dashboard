import { BaseRepository } from "./BaseRepository";
import { IUserEntity } from "../interfaces/IUser.interface";
import { IUserRepository } from "../interfaces/IRepository.interface";
import { User, IUser } from "../models/User";
import { memoryStore } from "../services/store";

export class UserRepository extends BaseRepository<IUserEntity, IUser> implements IUserRepository {
  constructor() {
    super(User, memoryStore.users);
  }

  protected mapToEntity(doc: any): IUserEntity {
    return {
      id: doc._id?.toString() || doc.id?.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      avatar: doc.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      bio: doc.bio || "",
      vocalType: doc.vocalType || doc.voiceType || "Tenor",
      experienceLevel: doc.experienceLevel || doc.skillLevel || "Intermediate",
      preferredGenres: doc.preferredGenres || ["Pop"],
      totalPracticeHours: doc.totalPracticeHours || (doc.totalPracticeMinutes ? doc.totalPracticeMinutes / 60 : 0),
      totalPracticeMinutes: doc.totalPracticeMinutes || (doc.totalPracticeHours ? Math.round(doc.totalPracticeHours * 60) : 0),
      currentStreak: doc.currentStreak || doc.streakDays || 0,
      longestStreak: doc.longestStreak || 0,
      lastActiveDate: doc.lastActiveDate || doc.lastPracticeDate || new Date(),
      preferences: doc.preferences || {
        darkTheme: true,
        autoAnalyze: true,
        audioInputDevice: "Default",
        notifications: true,
      },
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };
  }

  async findByEmail(email: string): Promise<IUserEntity | null> {
    const normalized = email.trim().toLowerCase();
    if (this.isDbAvailable()) {
      try {
        const doc = await this.model.findOne({ email: normalized }).lean();
        if (doc) return this.mapToEntity(doc);
      } catch (err) {}
    }
    const memUser = this.memoryCollection.find((u) => u.email?.toLowerCase() === normalized);
    return memUser ? this.mapToEntity(memUser) : null;
  }

  async findByEmailWithPassword(email: string): Promise<IUserEntity | null> {
    const normalized = email.trim().toLowerCase();
    if (this.isDbAvailable()) {
      try {
        const doc = await this.model.findOne({ email: normalized }).select("+password").lean();
        if (doc) return this.mapToEntity(doc);
      } catch (err) {}
    }
    const memUser = this.memoryCollection.find((u) => u.email?.toLowerCase() === normalized);
    return memUser ? this.mapToEntity(memUser) : null;
  }

  async findUsersWithActiveStreak(): Promise<IUserEntity[]> {
    if (this.isDbAvailable()) {
      try {
        const docs = await this.model.find({ currentStreak: { $gt: 0 } }).lean();
        return docs.map((d) => this.mapToEntity(d));
      } catch (err) {}
    }
    return this.memoryCollection
      .filter((u) => (u.currentStreak || u.streakDays || 0) > 0)
      .map((u) => this.mapToEntity(u));
  }

  async updatePracticeStats(userId: string, additionalMinutes: number): Promise<IUserEntity | null> {
    if (this.isDbAvailable()) {
      try {
        const additionalHours = additionalMinutes / 60;
        const doc = await this.model
          .findByIdAndUpdate(
            userId,
            {
              $inc: {
                totalPracticeHours: additionalHours,
              },
              $set: {
                lastActiveDate: new Date(),
              },
            },
            { new: true }
          )
          .lean();
        if (doc) return this.mapToEntity(doc);
      } catch (err) {}
    }

    const memUser = this.memoryCollection.find((u) => (u._id || u.id)?.toString() === userId.toString());
    if (memUser) {
      memUser.totalPracticeMinutes = (memUser.totalPracticeMinutes || 0) + additionalMinutes;
      memUser.totalPracticeHours = (memUser.totalPracticeHours || 0) + additionalMinutes / 60;
      memUser.lastActiveDate = new Date();
      return this.mapToEntity(memUser);
    }
    return null;
  }

  async updateStreak(userId: string, newStreak: number, longestStreak: number): Promise<IUserEntity | null> {
    if (this.isDbAvailable()) {
      try {
        const doc = await this.model
          .findByIdAndUpdate(
            userId,
            {
              $set: {
                currentStreak: newStreak,
                longestStreak,
                lastActiveDate: new Date(),
              },
            },
            { new: true }
          )
          .lean();
        if (doc) return this.mapToEntity(doc);
      } catch (err) {}
    }

    const memUser = this.memoryCollection.find((u) => (u._id || u.id)?.toString() === userId.toString());
    if (memUser) {
      memUser.currentStreak = newStreak;
      memUser.streakDays = newStreak;
      memUser.longestStreak = Math.max(longestStreak, newStreak);
      memUser.lastActiveDate = new Date();
      return this.mapToEntity(memUser);
    }
    return null;
  }

  async getLeaderboard(limit: number = 10): Promise<IUserEntity[]> {
    if (this.isDbAvailable()) {
      try {
        const docs = await this.model
          .find({})
          .sort({ totalPracticeHours: -1, currentStreak: -1 })
          .limit(limit)
          .lean();
        return docs.map((d) => this.mapToEntity(d));
      } catch (err) {}
    }

    return [...this.memoryCollection]
      .sort((a, b) => (b.totalPracticeHours || 0) - (a.totalPracticeHours || 0))
      .slice(0, limit)
      .map((u) => this.mapToEntity(u));
  }

  async getUserStatistics(userId: string): Promise<Record<string, any>> {
    const user = await this.findById(userId);
    if (!user) return {};

    return {
      userId: user.id,
      name: user.name,
      totalPracticeHours: Number(user.totalPracticeHours.toFixed(1)),
      totalPracticeMinutes: user.totalPracticeMinutes || Math.round(user.totalPracticeHours * 60),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      vocalType: user.vocalType,
      experienceLevel: user.experienceLevel,
      lastActiveDate: user.lastActiveDate,
    };
  }
}
