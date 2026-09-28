"use client";

import React from "react";
import {
  Award,
  Crosshair,
  Activity,
  Music,
  Flame,
  Sparkles,
  Mic,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { IAchievement } from "@/types";
import { formatDate } from "@/lib/utils";

interface AchievementsViewProps {
  achievementsData?: {
    total: number;
    unlockedCount: number;
    unlockedPercentage: number;
    achievements: IAchievement[];
  };
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievementsData }) => {
  const achievements = achievementsData?.achievements || [];
  const unlockedCount = achievementsData?.unlockedCount || achievements.filter((a) => a.isUnlocked).length;
  const total = achievementsData?.total || achievements.length;
  const pct = Math.round((unlockedCount / Math.max(1, total)) * 100);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Crosshair":
        return <Crosshair className="h-6 w-6 text-neon-cyan" />;
      case "Activity":
        return <Activity className="h-6 w-6 text-brand-400" />;
      case "Music":
        return <Music className="h-6 w-6 text-purple-400" />;
      case "Flame":
        return <Flame className="h-6 w-6 text-amber-400" />;
      case "Sparkles":
        return <Sparkles className="h-6 w-6 text-emerald-400" />;
      default:
        return <Mic className="h-6 w-6 text-cyan-300" />;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Diamond":
        return "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]";
      case "Gold":
        return "border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
      case "Silver":
        return "border-slate-300/30 bg-slate-300/10 text-slate-200";
      default:
        return "border-amber-700/30 bg-amber-700/10 text-amber-500";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Vocal Badges & Hall of Mastery
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Gamified technical milestones rewarding pitch accuracy, tessitura breadth, and dedicated practice habits.
          </p>
        </div>

        {/* Global Progress */}
        <div className="flex items-center space-x-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-2 backdrop-blur-xl">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Trophies Unlocked</span>
            <div className="text-sm font-black text-white font-mono">
              {unlockedCount} / {total} ({pct}%)
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => {
          const tierStyle = getTierBadge(ach.tier);
          return (
            <div
              key={ach._id}
              className={`relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-all duration-300 ${
                ach.isUnlocked
                  ? "border-white/[0.1] bg-white/[0.02] hover:border-brand-500/40 hover:bg-white/[0.04] shadow-glass"
                  : "border-white/[0.05] bg-white/[0.01] opacity-75"
              }`}
            >
              {/* Top ambient glow for unlocked */}
              {ach.isUnlocked && (
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-brand-500/15 blur-2xl" />
              )}

              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  {getBadgeIcon(ach.icon)}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${tierStyle}`}>
                  {ach.tier}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white">{ach.title}</h4>
                  {ach.isUnlocked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{ach.description}</p>
              </div>

              {/* Progress bar or Unlocked Date */}
              <div className="mt-4 border-t border-white/[0.06] pt-3">
                {ach.isUnlocked ? (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                    ✓ Unlocked on {formatDate(ach.unlockedAt || "")}
                  </span>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Requirement</span>
                      <span className="font-mono text-neon-cyan font-bold">
                        {ach.progress} / {ach.maxProgress}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
