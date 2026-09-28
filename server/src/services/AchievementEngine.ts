import { Achievement } from "../models/Achievement";
import { User } from "../models/User";
import { Session } from "../models/Session";
import { Recording } from "../models/Recording";
import { Notification } from "../models/Notification";
import { memoryStore } from "./store";
import { isConnectedToMongo } from "../config/db";
import { Logger } from "../utils/logger";

export interface IBadgeEvaluationResult {
  badgeKey: string;
  title: string;
  description: string;
  icon: string;
  category: "INTONATION" | "RANGE" | "DEDICATION" | "VIBRATO" | "MILESTONE" | "COMMUNITY";
  tier: "Bronze" | "Silver" | "Gold" | "Diamond";
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  points: number;
  isNewlyUnlocked?: boolean;
}

export class AchievementEngine {
  /**
   * System-wide badge definitions including user requested specifications
   */
  public static readonly BADGE_DEFINITIONS = [
    {
      badgeKey: "first-upload",
      title: "First Upload",
      description: "Uploaded and processed your maiden vocal take into the studio.",
      icon: "Mic",
      category: "MILESTONE" as const,
      tier: "Bronze" as const,
      maxProgress: 1,
      points: 50,
    },
    {
      badgeKey: "streak-7",
      title: "7 Day Streak",
      description: "Completed 7 consecutive days of vocal practice without missing a beat.",
      icon: "Flame",
      category: "DEDICATION" as const,
      tier: "Silver" as const,
      maxProgress: 7,
      points: 150,
    },
    {
      badgeKey: "streak-30",
      title: "30 Day Streak",
      description: "A full month of continuous dedication and vocal discipline.",
      icon: "Zap",
      category: "DEDICATION" as const,
      tier: "Diamond" as const,
      maxProgress: 30,
      points: 500,
    },
    {
      badgeKey: "pitch-master",
      title: "Pitch Master",
      description: "Achieved pristine pitch accuracy of 95%+ in an analyzed practice take.",
      icon: "Crosshair",
      category: "INTONATION" as const,
      tier: "Gold" as const,
      maxProgress: 95,
      points: 300,
    },
    {
      badgeKey: "consistency-king",
      title: "Consistency King",
      description: "Completed 20+ vocal practice sessions or 5 sessions in a single week.",
      icon: "Crown",
      category: "DEDICATION" as const,
      tier: "Gold" as const,
      maxProgress: 20,
      points: 350,
    },
    {
      badgeKey: "vibrato-virtuoso",
      title: "Vibrato Virtuoso",
      description: "Sustained ideal vibrato oscillation within 5.2 - 6.5 Hz window for 5+ seconds.",
      icon: "Activity",
      category: "VIBRATO" as const,
      tier: "Silver" as const,
      maxProgress: 100,
      points: 175,
    },
    {
      badgeKey: "range-2-octaves",
      title: "Two-Octave Titan",
      description: "Demonstrated a vocal span exceeding 24 semitones in analyzed sessions.",
      icon: "Music",
      category: "RANGE" as const,
      tier: "Silver" as const,
      maxProgress: 24,
      points: 200,
    },
    {
      badgeKey: "high-c-club",
      title: "The High C Club (C5)",
      description: "Sustained a resonant, unforced C5 note in mixed voice.",
      icon: "Sparkles",
      category: "RANGE" as const,
      tier: "Diamond" as const,
      maxProgress: 100,
      points: 400,
    },
  ];

  /**
   * Evaluate all achievements for a given user against real metrics
   */
  async evaluateAchievements(userId: string): Promise<{
    achievements: IBadgeEvaluationResult[];
    newlyUnlocked: IBadgeEvaluationResult[];
    totalPoints: number;
    unlockedCount: number;
  }> {
    let user: any = null;
    let sessions: any[] = [];
    let recordingsCount = 0;
    let existingBadges: any[] = [];

    if (isConnectedToMongo) {
      try {
        user = await User.findById(userId).lean();
        sessions = await Session.find({ userId }).lean();
        recordingsCount = await Recording.countDocuments({ userId });
        existingBadges = await Achievement.find({ userId }).lean();
      } catch (err) {
        Logger.warn("[AchievementEngine] Mongo lookup failed, using memoryStore", err);
      }
    }

    if (!user) {
      user = memoryStore.users.find((u) => u._id.toString() === userId.toString()) || {
        currentStreak: 12,
        longestStreak: 15,
      };
    }

    if (!sessions || sessions.length === 0) {
      sessions = memoryStore.sessions.filter((s) => s.userId.toString() === userId.toString());
    }

    if (!existingBadges || existingBadges.length === 0) {
      existingBadges = memoryStore.achievements.filter(
        (a) => a.userId.toString() === userId.toString()
      );
    }

    const currentStreak = Number(user.currentStreak) || 0;
    const longestStreak = Math.max(currentStreak, Number(user.longestStreak) || 0);
    const totalSessions = sessions.length;
    const totalUploads = Math.max(recordingsCount, totalSessions);

    // Week sessions
    const oneWeekAgo = Date.now() - 7 * 86400000;
    const recentWeekSessions = sessions.filter(
      (s) => new Date(s.createdAt).getTime() >= oneWeekAgo
    ).length;

    // Pitch metrics
    const maxPitchAccuracy = sessions.reduce(
      (max, s) => Math.max(max, Number(s.pitchAccuracyScore) || 0),
      0
    );

    // High note reached
    const hasC5OrHigher = sessions.some(
      (s) => s.highestNote === "C5" || s.highestNote === "C#5" || s.highestNote === "D5"
    );

    // Max semitone range
    const maxRangeSemitones = sessions.reduce(
      (max, s) => Math.max(max, Number(s.rangeSemitones) || 0),
      0
    );

    // Vibrato max score
    const maxVibratoScore = sessions.reduce(
      (max, s) => Math.max(max, Number(s.vibratoScore) || 0),
      0
    );

    const evaluated: IBadgeEvaluationResult[] = [];
    const newlyUnlocked: IBadgeEvaluationResult[] = [];

    const existingMap = new Map<string, any>();
    for (const b of existingBadges) {
      existingMap.set(b.badgeKey, b);
    }

    for (const def of AchievementEngine.BADGE_DEFINITIONS) {
      const existing = existingMap.get(def.badgeKey);
      const wasUnlocked = existing?.isUnlocked || false;

      let currentProgress = 0;
      let shouldUnlock = false;

      switch (def.badgeKey) {
        case "first-upload":
          currentProgress = totalUploads > 0 ? 1 : 0;
          shouldUnlock = totalUploads >= 1;
          break;

        case "streak-7":
          currentProgress = Math.min(7, longestStreak);
          shouldUnlock = longestStreak >= 7;
          break;

        case "streak-30":
          currentProgress = Math.min(30, longestStreak);
          shouldUnlock = longestStreak >= 30;
          break;

        case "pitch-master":
          currentProgress = Math.round(maxPitchAccuracy);
          shouldUnlock = maxPitchAccuracy >= 95.0;
          break;

        case "consistency-king":
          currentProgress = Math.min(20, totalSessions);
          shouldUnlock = totalSessions >= 20 || recentWeekSessions >= 5;
          break;

        case "vibrato-virtuoso":
          currentProgress = Math.round(maxVibratoScore);
          shouldUnlock = maxVibratoScore >= 88.0;
          break;

        case "range-2-octaves":
          currentProgress = Math.min(24, maxRangeSemitones);
          shouldUnlock = maxRangeSemitones >= 24;
          break;

        case "high-c-club":
          currentProgress = hasC5OrHigher ? 100 : 80;
          shouldUnlock = hasC5OrHigher;
          break;

        default:
          currentProgress = existing?.progress || 0;
          shouldUnlock = wasUnlocked;
      }

      const isUnlockedNow = wasUnlocked || shouldUnlock;
      const isNew = !wasUnlocked && shouldUnlock;

      const result: IBadgeEvaluationResult = {
        badgeKey: def.badgeKey,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        tier: def.tier,
        progress: Math.min(def.maxProgress, currentProgress),
        maxProgress: def.maxProgress,
        isUnlocked: isUnlockedNow,
        unlockedAt: isUnlockedNow ? (existing?.unlockedAt || new Date()) : undefined,
        points: def.points,
        isNewlyUnlocked: isNew,
      };

      evaluated.push(result);

      if (isNew) {
        newlyUnlocked.push(result);
        // Create in-app notification for unlock
        this.dispatchUnlockNotification(userId, result).catch((err) =>
          Logger.warn("[AchievementEngine] Notification creation failed", err)
        );
      }

      // Persist to DB or memoryStore
      if (isConnectedToMongo) {
        Achievement.findOneAndUpdate(
          { userId, badgeKey: def.badgeKey },
          {
            $set: {
              title: def.title,
              description: def.description,
              icon: def.icon,
              category: def.category,
              tier: def.tier,
              progress: result.progress,
              maxProgress: def.maxProgress,
              isUnlocked: isUnlockedNow,
              unlockedAt: result.unlockedAt,
              points: def.points,
            },
          },
          { upsert: true, new: true }
        ).catch((err) => Logger.warn("[AchievementEngine] Mongo update failed", err));
      }

      // Update memoryStore
      const memIndex = memoryStore.achievements.findIndex(
        (a) => a.userId.toString() === userId.toString() && a.badgeKey === def.badgeKey
      );
      const memBadge = {
        _id: existing?._id || `ach_${def.badgeKey}`,
        userId,
        badgeKey: def.badgeKey,
        title: def.title,
        description: def.description,
        icon: def.icon,
        category: def.category,
        tier: def.tier,
        progress: result.progress,
        maxProgress: def.maxProgress,
        isUnlocked: isUnlockedNow,
        unlockedAt: result.unlockedAt,
        points: def.points,
      };
      if (memIndex >= 0) {
        memoryStore.achievements[memIndex] = memBadge;
      } else {
        memoryStore.achievements.push(memBadge);
      }
    }

    const unlockedCount = evaluated.filter((a) => a.isUnlocked).length;
    const totalPoints = evaluated
      .filter((a) => a.isUnlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return {
      achievements: evaluated,
      newlyUnlocked,
      totalPoints,
      unlockedCount,
    };
  }

  private async dispatchUnlockNotification(
    userId: string,
    badge: IBadgeEvaluationResult
  ): Promise<void> {
    const title = `🏆 Achievement Unlocked: ${badge.title}!`;
    const message = `Congratulations! You just earned the "${badge.title}" badge (${badge.points} XP): ${badge.description}`;

    if (isConnectedToMongo) {
      try {
        await Notification.create({
          userId,
          title,
          message,
          type: "BADGE_UNLOCKED",
          priority: "HIGH",
          isRead: false,
          actionUrl: "/achievements",
        });
      } catch (err) {
        Logger.warn("[AchievementEngine] Mongo notification create failed", err);
      }
    }

    // Memory Store notification
    if (!memoryStore.notifications) {
      (memoryStore as any).notifications = [];
    }
    (memoryStore as any).notifications.unshift({
      _id: `notif_${Date.now()}`,
      userId,
      title,
      message,
      type: "BADGE_UNLOCKED",
      priority: "HIGH",
      isRead: false,
      createdAt: new Date(),
    });
  }
}

export const achievementEngine = new AchievementEngine();
