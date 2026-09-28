"use client";

import React from "react";
import { Mic, Flame, Clock, Sparkles, Activity, Music, User } from "lucide-react";
import { useVocalStore } from "@/store/useVocalStore";

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useVocalStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          className="flex cursor-pointer items-center space-x-3 transition-transform hover:scale-[1.02]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-neon-cyan p-0.5 shadow-glow">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#090d16]">
              <Activity className="h-5 w-5 text-neon-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-tight text-lg text-white">
                Vocalytics<span className="text-neon-cyan">.AI</span>
              </span>
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              AI Vocal Analysis & Pedagogical Coaching
            </p>
          </div>
        </div>

        {/* Top KPI Badges */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Streak Badge */}
          <div className="flex items-center space-x-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
            <span>{user?.streakDays ?? user?.currentStreak ?? 0} Day Streak</span>
          </div>

          {/* Practice Time */}
          <div className="flex items-center space-x-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
            <Clock className="h-3.5 w-3.5 text-brand-400" />
            <span>{user?.totalPracticeMinutes ?? Math.round((user?.totalPracticeHours || 0) * 60)} min practiced</span>
          </div>

          {/* Voice Type */}
          <div className="flex items-center space-x-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Music className="h-3.5 w-3.5 text-cyan-400" />
            <span>{user?.voiceType || user?.vocalType || "Tenor"} ({user?.vocalRangeLowest || "C3"} - {user?.vocalRangeHighest || "A4"})</span>
          </div>
        </div>

        {/* Action Button & User Avatar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab("studio")}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-neon-cyan px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:opacity-95 hover:shadow-glow-cyan active:scale-95"
          >
            <Mic className="h-4 w-4" />
            <span>Record / Upload</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center space-x-2 rounded-xl border border-white/[0.1] bg-white/[0.04] p-1.5 pr-3 hover:bg-white/[0.08] transition"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="h-7 w-7 rounded-lg object-cover border border-white/[0.15]"
            />
            <span className="hidden lg:inline text-xs font-medium text-slate-200">
              {user?.name || "Elena Vance"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
