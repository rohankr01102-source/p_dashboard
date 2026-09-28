"use client";

import React from "react";
import { Crosshair, Music, Clock, Flame, TrendingUp, Sparkles } from "lucide-react";
import { IUser } from "@/types";

interface StatCardsProps {
  user: IUser | null;
  analyticsData?: any;
}

export const StatCards: React.FC<StatCardsProps> = ({ user, analyticsData }) => {
  const kpis = analyticsData?.kpis || {};

  const stats = [
    {
      title: "Intonation Index",
      value: `${kpis.avgPitchAccuracy || 87.8}%`,
      sub: "Pitch accuracy score",
      badge: "Grade A",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      icon: Crosshair,
      glowColor: "from-emerald-500/20 to-teal-500/5",
      borderColor: "hover:border-emerald-500/40",
      trend: "+4.2% this week",
    },
    {
      title: "Demonstrated Range",
      value: kpis.currentRange || "C3 - A4",
      sub: "21 Semitones covered",
      badge: "Tenor Mix",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      icon: Music,
      glowColor: "from-cyan-500/20 to-blue-500/5",
      borderColor: "hover:border-cyan-500/40",
      trend: "Expanded 2 semitones",
    },
    {
      title: "Practice Volume",
      value: `${user?.totalPracticeMinutes ?? kpis.totalMinutes ?? 0}m`,
      sub: `${user?.totalSessionsCount ?? kpis.totalSessions ?? 0} recorded sessions`,
      badge: "Consistent",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      icon: Clock,
      glowColor: "from-indigo-500/20 to-purple-500/5",
      borderColor: "hover:border-indigo-500/40",
      trend: "+18% vs last month",
    },
    {
      title: "Daily Practice Streak",
      value: `${user?.streakDays ?? user?.currentStreak ?? kpis.streakDays ?? 0} Days`,
      sub: (user?.streakDays || user?.currentStreak) ? "Active streak" : "Start your streak today",
      badge: (user?.streakDays || user?.currentStreak) ? "On Fire" : "Building",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      icon: Flame,
      glowColor: "from-amber-500/20 to-orange-500/5",
      borderColor: "hover:border-amber-500/40",
      trend: (user?.streakDays || user?.currentStreak) ? "Personal Best!" : "Practice now",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.04] ${stat.borderColor} shadow-glass`}
          >
            {/* Top ambient glow */}
            <div
              className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${stat.glowColor} blur-2xl transition-opacity group-hover:opacity-100`}
            />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] group-hover:scale-110 transition-transform">
                <Icon className="h-4 w-4 text-neon-cyan" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-2xl font-black tracking-tight text-white font-mono">
                {stat.value}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${stat.badgeColor}`}
              >
                {stat.badge}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[11px] text-slate-400">
              <span>{stat.sub}</span>
              <span className="flex items-center font-medium text-emerald-400">
                <TrendingUp className="mr-1 h-3 w-3" />
                {stat.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
