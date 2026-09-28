"use client";

import React from "react";
import { Mic, Upload, Sparkles, Target, Award, ArrowUpRight, Flame, ChevronRight } from "lucide-react";
import { StatCards } from "./StatCards";
import { VocalRadarOverview } from "./VocalRadarOverview";
import { RecentSessions } from "./RecentSessions";
import { useVocalStore } from "@/store/useVocalStore";
import { ISession, IUser, IGoal, IAchievement } from "@/types";

interface DashboardOverviewProps {
  user: IUser | null;
  sessions: ISession[];
  goals: IGoal[];
  achievements: IAchievement[];
  analyticsData?: any;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  sessions,
  goals,
  achievements,
  analyticsData,
}) => {
  const { setActiveTab, setSelectedSession } = useVocalStore();

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const nextBadge = achievements.find((a) => !a.isUnlocked);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-r from-brand-950/60 via-[#0c1427]/80 to-brand-950/40 p-6 md:p-8 backdrop-blur-2xl shadow-glass">
        {/* Glow orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-neon-cyan/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-xs font-semibold text-neon-cyan mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Vocalytics AI Audio Engine v1.0 Ready</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Elevate Your Voice,{" "}
              <span className="bg-gradient-to-r from-neon-cyan via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {user?.name || "Elena"}
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Your intonation accuracy has improved by <strong className="text-neon-cyan">+4.2%</strong> this week.
              Current vocal tessitura shows healthy stability across your <strong className="text-white">C3 – A4</strong> range.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab("studio")}
              className="flex items-center space-x-2 rounded-2xl bg-gradient-to-r from-neon-cyan via-cyan-500 to-brand-500 px-5 py-3 text-xs font-extrabold text-slate-950 shadow-glow-cyan transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="h-4 w-4" />
              <span>Start Vocal Practice</span>
            </button>

            <button
              onClick={() => setActiveTab("studio")}
              className="flex items-center space-x-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Upload className="h-4 w-4 text-slate-400" />
              <span>Upload Audio Take</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <StatCards user={user} analyticsData={analyticsData} />

      {/* Radar Geometry & Intonation Area Chart */}
      <VocalRadarOverview
        radarMetrics={analyticsData?.radarMetrics}
        progressTimeline={analyticsData?.progressTimeline}
      />

      {/* Lower Section: Recent Sessions + Active Goals / Badges */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Practice Sessions (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Recent Vocal Practice Sessions
              </h3>
              <p className="text-xs text-slate-400">
                Latest takes evaluated with pitch contour, vibrato rate & AI coaching drills.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("sessions")}
              className="flex items-center text-xs font-semibold text-neon-cyan hover:underline"
            >
              <span>View All ({sessions.length})</span>
              <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>

          <RecentSessions sessions={sessions} />
        </div>

        {/* Goals & Next Badge Unlocks (4 Cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Active Goals Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl shadow-glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-brand-400" />
                <h4 className="text-sm font-bold text-white">Active Goals</h4>
              </div>
              <button
                onClick={() => setActiveTab("goals")}
                className="text-[11px] text-neon-cyan hover:underline font-semibold"
              >
                Manage
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {activeGoals.slice(0, 3).map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal._id} className="rounded-xl border border-white/[0.05] bg-white/[0.01] p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{goal.title}</span>
                      <span className="font-mono text-neon-cyan font-bold">{pct}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-neon-cyan transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <span>Target: this week</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Achievement Card */}
          {nextBadge && (
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5 backdrop-blur-xl shadow-glass">
              <div className="flex items-center space-x-2 text-amber-300">
                <Award className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Next Unlockable Badge</span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold text-white">{nextBadge.title}</h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">{nextBadge.description}</p>
              
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-amber-400 font-mono">
                    {nextBadge.progress} / {nextBadge.maxProgress}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.1] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${Math.min(100, (nextBadge.progress / nextBadge.maxProgress) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
