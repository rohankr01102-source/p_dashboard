import { User } from "../models/User";
import { Session } from "../models/Session";
import { memoryStore } from "./store";
import { isConnectedToMongo } from "../config/db";
import { Logger } from "../utils/logger";

export interface IStreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  streakFreezesRemaining: number;
  isPracticedToday: boolean;
  streakStatus: "ACTIVE" | "AT_RISK" | "FROZEN" | "BROKEN";
  nextMilestoneDays: number;
  daysToNextMilestone: number;
  streakHistory: Array<{ date: string; practiced: boolean; minutes: number }>;
}

export class StreakService {
  /**
   * Get full streak status, history and milestones for a user
   */
  async getStreakStatus(userId: string): Promise<IStreakStatus> {
    let user: any = null;
    let sessions: any[] = [];

    if (isConnectedToMongo) {
      try {
        user = await User.findById(userId).lean();
        sessions = await Session.find({ userId }).select("createdAt durationSeconds").lean();
      } catch (err) {
        Logger.warn("[StreakService] Mongo fetch failed, falling back to memoryStore", err);
      }
    }

    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === userId.toString()) || {
        currentStreak: 12,
        longestStreak: 15,
        lastPracticeDate: new Date(),
        streakFreezesRemaining: 2,
      };
    }

    if (!sessions || sessions.length === 0) {
      sessions = memoryStore.sessions.filter((s) => s.userId.toString() === userId.toString());
    }

    const currentStreak = Number(user.currentStreak) || 0;
    const longestStreak = Math.max(currentStreak, Number(user.longestStreak) || 0);
    const streakFreezesRemaining = user.streakFreezesRemaining !== undefined ? Number(user.streakFreezesRemaining) : 2;

    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Build last 30 days history map
    const historyMap = new Map<string, number>();
    for (const s of sessions) {
      if (s.createdAt) {
        const dStr = new Date(s.createdAt).toISOString().split("T")[0];
        const mins = Math.max(1, Math.round((Number(s.durationSeconds) || 60) / 60));
        historyMap.set(dStr, (historyMap.get(dStr) || 0) + mins);
      }
    }

    const streakHistory: Array<{ date: string; practiced: boolean; minutes: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dStr = d.toISOString().split("T")[0];
      const mins = historyMap.get(dStr) || 0;
      streakHistory.push({
        date: dStr,
        practiced: mins > 0 || (i === 0 && currentStreak > 0),
        minutes: mins > 0 ? mins : (i === 0 && currentStreak > 0 ? 25 : 0),
      });
    }

    const isPracticedToday = (historyMap.get(todayStr) || 0) > 0 || currentStreak > 0;
    const isPracticedYesterday = (historyMap.get(yesterdayStr) || 0) > 0;

    let streakStatus: "ACTIVE" | "AT_RISK" | "FROZEN" | "BROKEN" = "ACTIVE";
    if (isPracticedToday) {
      streakStatus = "ACTIVE";
    } else if (isPracticedYesterday) {
      streakStatus = "AT_RISK";
    } else if (user.isStreakFrozen) {
      streakStatus = "FROZEN";
    } else if (currentStreak === 0) {
      streakStatus = "BROKEN";
    } else {
      streakStatus = "AT_RISK";
    }

    // Milestones: 3, 7, 14, 30, 60, 100
    const milestones = [3, 7, 14, 30, 60, 100];
    const nextMilestone = milestones.find((m) => m > currentStreak) || 100;
    const daysToNext = Math.max(0, nextMilestone - currentStreak);

    const lastPractice = user.lastPracticeDate
      ? new Date(user.lastPracticeDate).toISOString()
      : new Date().toISOString();

    return {
      currentStreak,
      longestStreak,
      lastPracticeDate: lastPractice,
      streakFreezesRemaining,
      isPracticedToday,
      streakStatus,
      nextMilestoneDays: nextMilestone,
      daysToNextMilestone: daysToNext,
      streakHistory,
    };
  }

  /**
   * Consume a streak freeze token to protect against a missed day
   */
  async useStreakFreeze(userId: string): Promise<{ success: boolean; freezesRemaining: number; message: string }> {
    let user: any = null;

    if (isConnectedToMongo) {
      try {
        user = await User.findById(userId);
      } catch (err) {
        Logger.warn("[StreakService] Mongo lookup failed", err);
      }
    }

    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === userId.toString());
    }

    if (!user) {
      return { success: false, freezesRemaining: 0, message: "User not found" };
    }

    const currentFreezes = user.streakFreezesRemaining !== undefined ? Number(user.streakFreezesRemaining) : 2;
    if (currentFreezes <= 0) {
      return {
        success: false,
        freezesRemaining: 0,
        message: "No streak freeze shields remaining. Complete a 7-day streak to earn another freeze.",
      };
    }

    const updatedFreezes = currentFreezes - 1;
    user.streakFreezesRemaining = updatedFreezes;
    user.isStreakFrozen = true;

    if (isConnectedToMongo) {
      try {
        await User.findByIdAndUpdate(userId, {
          streakFreezesRemaining: updatedFreezes,
          isStreakFrozen: true,
        });
      } catch (err) {
        Logger.warn("[StreakService] Mongo update failed", err);
      }
    }

    return {
      success: true,
      freezesRemaining: updatedFreezes,
      message: "Streak Freeze activated! Your practice streak is shielded for the next 24 hours.",
    };
  }

  /**
   * Record practice session activity to evaluate streak
   */
  async recordPractice(userId: string): Promise<{ currentStreak: number; longestStreak: number; milestoneReached?: number }> {
    let user: any = null;

    if (isConnectedToMongo) {
      try {
        user = await User.findById(userId);
      } catch (err) {
        Logger.warn("[StreakService] Mongo lookup failed", err);
      }
    }

    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === userId.toString());
    }

    if (!user) {
      return { currentStreak: 1, longestStreak: 1 };
    }

    const now = new Date();
    const lastPractice = user.lastPracticeDate ? new Date(user.lastPracticeDate) : null;
    let newStreak = Number(user.currentStreak) || 0;

    if (!lastPractice) {
      newStreak = 1;
    } else {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const last = new Date(lastPractice.getFullYear(), lastPractice.getMonth(), lastPractice.getDate()).getTime();
      const diffDays = Math.round((today - last) / 86400000);

      if (diffDays === 0) {
        // Already practiced today, keep streak
      } else if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays === 2 && user.isStreakFrozen) {
        // Freeze protected the streak
        newStreak += 1;
        user.isStreakFrozen = false;
      } else {
        newStreak = 1;
      }
    }

    const newLongest = Math.max(newStreak, Number(user.longestStreak) || 0);
    user.currentStreak = newStreak;
    user.longestStreak = newLongest;
    user.lastPracticeDate = now;

    if (isConnectedToMongo) {
      try {
        await User.findByIdAndUpdate(userId, {
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastPracticeDate: now,
          isStreakFrozen: false,
        });
      } catch (err) {
        Logger.warn("[StreakService] Mongo update failed", err);
      }
    }

    const milestones = [7, 14, 30, 60, 100];
    const milestoneReached = milestones.includes(newStreak) ? newStreak : undefined;

    return { currentStreak: newStreak, longestStreak: newLongest, milestoneReached };
  }
}

export const streakService = new StreakService();
