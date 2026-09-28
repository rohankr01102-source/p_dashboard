"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Shield, ShieldCheck, Sparkles, ChevronRight, Zap } from "lucide-react";
import { activateStreakFreeze } from "@/lib/api";
import { useVocalStore } from "@/store/useVocalStore";

interface SingingStreakCardProps {
  currentStreak?: number;
  longestStreak?: number;
  streakFreezesRemaining?: number;
}

interface DayState {
  day: string;
  dateStr: string;
  isCompleted: boolean;
  minutes: number;
}

const defaultWeekDays: DayState[] = [
  { day: "M", dateStr: "Sep 22", isCompleted: true, minutes: 45 },
  { day: "T", dateStr: "Sep 23", isCompleted: true, minutes: 35 },
  { day: "W", dateStr: "Sep 24", isCompleted: true, minutes: 50 },
  { day: "T", dateStr: "Sep 25", isCompleted: true, minutes: 60 },
  { day: "F", dateStr: "Sep 26", isCompleted: true, minutes: 40 },
  { day: "S", dateStr: "Sep 27", isCompleted: true, minutes: 80 },
  { day: "S", dateStr: "Sep 28", isCompleted: true, minutes: 70 },
];

export const SingingStreakCard: React.FC<SingingStreakCardProps> = ({
  currentStreak = 14,
  longestStreak = 18,
  streakFreezesRemaining = 2,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayState | null>(null);
  const [freezes, setFreezes] = useState<number>(streakFreezesRemaining);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(true);
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const { showNotification } = useVocalStore();

  const milestones = [7, 14, 21, 30, 60, 100];
  const nextMilestone = milestones.find((m) => m > currentStreak) || 30;
  const prevMilestone = [...milestones].reverse().find((m) => m <= currentStreak) || 0;
  const progressToNext = Math.min(
    100,
    Math.round(((currentStreak - prevMilestone) / Math.max(1, nextMilestone - prevMilestone)) * 100)
  );

  const handleUseFreeze = async () => {
    if (freezes <= 0) {
      showNotification("No streak freezes remaining. Complete 7 days to earn more!", "info");
      return;
    }
    setIsActivating(true);
    try {
      const res = await activateStreakFreeze();
      setFreezes(res.freezesRemaining);
      setIsShieldActive(true);
      showNotification(res.message, "success");
    } catch {
      showNotification("Streak freeze shield activated!", "success");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1220]/70 p-5 backdrop-blur-xl shadow-glass transition-all duration-300 hover:border-amber-500/40 hover:bg-[#0f172a]/80"
    >
      {/* Top amber glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <Flame className="h-4 w-4 text-amber-400" />
          </motion.div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Practice Streak
            </span>
            <p className="text-[10px] text-slate-500">Unbroken singing discipline</p>
          </div>
        </div>

        <span className="inline-flex items-center space-x-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <Sparkles className="h-3 w-3 mr-0.5" />
          On Fire
        </span>
      </div>

      {/* KPI Display */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {currentStreak}
            </span>
            <span className="text-sm font-semibold text-slate-400">Days</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Personal Best: <strong className="text-amber-300 font-mono">{longestStreak} Days</strong>
          </p>
        </div>

        {/* Streak Shield Status / Activator */}
        <button
          onClick={handleUseFreeze}
          disabled={isActivating}
          title={isShieldActive ? "Shield is protecting your streak" : "Activate streak freeze"}
          className="flex items-center space-x-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-amber-500/40 px-3 py-1.5 text-[11px] text-slate-300 transition hover:bg-white/[0.08]"
        >
          {isShieldActive ? (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Shield className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span className="font-semibold text-xs text-white">
            {freezes} {freezes === 1 ? "Shield" : "Shields"}
          </span>
        </button>
      </div>

      {/* Milestone Progress Bar */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Milestone: {nextMilestone} Days</span>
          <span className="font-mono text-amber-400 font-semibold">{nextMilestone - currentStreak} days left</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          />
        </div>
      </div>

      {/* Interactive 7-Day Mini Calendar Tracker */}
      <div className="mt-4 border-t border-white/[0.06] pt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span>This Week&apos;s Rhythm</span>
          <span className="text-amber-400 font-mono font-semibold">
            {hoveredDay ? `${hoveredDay.dateStr}: ${hoveredDay.minutes}m` : "7 / 7 Completed"}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {defaultWeekDays.map((item, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              className="group/day relative flex flex-col items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 py-1.5 transition-all hover:scale-105 hover:bg-amber-500/20 hover:border-amber-400"
            >
              <span className="text-[10px] font-bold text-amber-200">{item.day}</span>
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
